<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display a listing of pharmacy product categories.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $filters = request()->only('search', 'trashed');
        $query = Category::query()->withCount('products');

        // Search functionality
        if (!empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                  ->orWhere('kode_prefix', 'like', $searchTerm)
                  ->orWhere('description', 'like', $searchTerm);
            });
        }

        // Filter by status
        $this->applyStatusFilter($query, $filters['trashed'] ?? null);

        $categories = $query->latest('updated_at')->paginate(15)->withQueryString();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'filters' => $filters,
            'statistics' => $this->getCategoryStatistics(),
        ]);
    }

    /**
     * Show the form for creating a new pharmacy category.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Categories/Create', [
            'suggestedCategories' => $this->getSuggestedCategories(),
        ]);
    }

    /**
     * Store a newly created pharmacy category.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $this->validateCategoryData($request);

        try {
            Category::create($validated);

            return redirect()
                ->route('categories.index')
                ->with('success', 'Kategori obat berhasil ditambahkan ke sistem.');

        } catch (\Exception $e) {
            return $this->handleError($e, 'menyimpan');
        }
    }

    /**
     * Show the form for editing the specified pharmacy category.
     *
     * @param  \App\Models\Category  $category
     * @return \Inertia\Response
     */
    public function edit(Category $category)
    {
        $category->loadCount('products');

        return Inertia::render('Categories/Edit', [
            'category' => $category,
            'hasProducts' => $category->products_count > 0,
            'relatedProductsCount' => $category->products_count,
        ]);
    }

    /**
     * Update the specified pharmacy category.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Category $category)
    {
        $validated = $this->validateCategoryData($request, $category);

        try {
            $this->checkActiveStatusChange($category, $validated['is_active']);
            $category->update($validated);

            return redirect()
                ->route('categories.index')
                ->with('success', 'Kategori obat berhasil diperbarui.');

        } catch (\Exception $e) {
            return $this->handleError($e, 'memperbarui');
        }
    }

    /**
     * Remove the specified pharmacy category from storage.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Category $category)
{
    try {
        // Pindahkan semua produk ke kategori default atau uncategorized
        $defaultCategory = Category::where('name', 'Uncategorized')->first();
        
        if ($defaultCategory) {
            $category->products()->update(['category_id' => $defaultCategory->id]);
        }

        $categoryName = $category->name;
        $category->delete();

        return redirect()
            ->back()
            ->with('success', "Kategori '{$categoryName}' berhasil dihapus.");
            
    } catch (\Exception $e) {
        return redirect()
            ->back()
            ->with('error', 'Gagal menghapus kategori: ' . $e->getMessage());
    }
}

    /**
     * Restore the specified soft-deleted pharmacy category.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function restore($id)
    {
        try {
            $category = Category::withTrashed()->findOrFail($id);
            $this->checkRestoreConflicts($category);
            
            $category->restore();

            return redirect()
                ->back()
                ->with('success', "Kategori '{$category->name}' berhasil dipulihkan.");

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Terjadi kesalahan saat memulihkan kategori: ' . $e->getMessage());
        }
    }

    /**
     * Permanently delete the specified pharmacy category.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function forceDelete($id)
    {
        try {
            $category = Category::withTrashed()->findOrFail($id);
            $categoryName = $category->name;
            
            $category->forceDelete();

            return redirect()
                ->back()
                ->with('success', "Kategori '{$categoryName}' berhasil dihapus permanen dari sistem.");

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Terjadi kesalahan saat menghapus permanen kategori: ' . $e->getMessage());
        }
    }

    /**
     * Get categories for reports or API usage.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getForReports()
    {
        try {
            $categories = $this->getReportCategories();

            return response()->json([
                'success' => true,
                'message' => 'Data kategori berhasil dimuat.',
                'data' => $categories,
                'total' => $categories->count()
            ]);

        } catch (\Exception $e) {
            return $this->jsonErrorResponse($e, 'memuat data kategori untuk laporan');
        }
    }

    /**
     * Get comprehensive category statistics for dashboard.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics()
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Statistik kategori berhasil dimuat.',
                'data' => $this->getStatisticsData(),
            ]);

        } catch (\Exception $e) {
            return $this->jsonErrorResponse($e, 'memuat statistik kategori');
        }
    }

    /**
     * Export categories data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function export(Request $request)
    {
        try {
            $format = $request->get('format', 'excel');
            $categories = $this->getExportData($request);

            return response()->json([
                'success' => true,
                'message' => 'Data kategori siap untuk diekspor.',
                'data' => $categories,
                'format' => $format,
                'exported_at' => now()->format('Y-m-d H:i:s')
            ]);

        } catch (\Exception $e) {
            return $this->jsonErrorResponse($e, 'mengekspor data kategori');
        }
    }

    /**
     * Bulk operations for categories.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:categories,id'
        ]);

        try {
            $affectedCount = $this->processBulkAction(
                $validated['action'], 
                $validated['category_ids']
            );

            return $this->bulkActionResponse($validated['action'], $affectedCount);

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Terjadi kesalahan saat melakukan operasi bulk: ' . $e->getMessage());
        }
    }

    // ============================================
    // PRIVATE HELPER METHODS
    // ============================================

    /**
     * Apply status filter to the query.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string|null  $filter
     * @return void
     */
    private function applyStatusFilter($query, $filter)
    {
        switch ($filter) {
            case 'with':
                $query->withTrashed();
                break;
            case 'only':
                $query->where('is_active', true);
                break;
            case 'only_trashed':
                $query->onlyTrashed();
                break;
            default:
                $query->where('is_active', true);
        }
    }

    /**
     * Get suggested categories for new category creation.
     *
     * @return array
     */
    private function getSuggestedCategories()
    {
        return [
            ['name' => 'Obat Keras', 'prefix' => 'OK', 'description' => 'Obat yang memerlukan resep dokter'],
            ['name' => 'Obat Bebas Terbatas', 'prefix' => 'OBT', 'description' => 'Obat bebas dengan tanda peringatan'],
            ['name' => 'Obat Bebas', 'prefix' => 'OB', 'description' => 'Obat yang dapat dibeli tanpa resep'],
            ['name' => 'Vitamin & Suplemen', 'prefix' => 'VIT', 'description' => 'Produk vitamin dan suplemen kesehatan'],
            ['name' => 'Perawatan Kulit', 'prefix' => 'SK', 'description' => 'Produk perawatan dan kesehatan kulit'],
            ['name' => 'Perawatan Bayi', 'prefix' => 'BBY', 'description' => 'Produk khusus perawatan bayi dan anak'],
            ['name' => 'Alat Kesehatan', 'prefix' => 'ALK', 'description' => 'Peralatan medis dan alat kesehatan'],
            ['name' => 'Herbal & Tradisional', 'prefix' => 'HRB', 'description' => 'Obat herbal dan tradisional'],
        ];
    }

    /**
     * Validate category data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Category|null  $category
     * @return array
     */
    private function validateCategoryData(Request $request, ?Category $category = null)
    {
        $rules = [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('categories')->whereNull('deleted_at')
            ],
            'kode_prefix' => [
                'required',
                'string',
                'max:10',
                'alpha_dash',
                Rule::unique('categories')->whereNull('deleted_at')
            ],
            'description' => 'nullable|string|max:500',
            'is_active' => 'required|boolean',
        ];

        if ($category) {
            $rules['name'][3] = $rules['name'][3]->ignore($category->id);
            $rules['kode_prefix'][4] = $rules['kode_prefix'][4]->ignore($category->id);
        }

        $messages = [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.unique' => 'Nama kategori sudah digunakan.',
            'name.max' => 'Nama kategori maksimal 100 karakter.',
            'kode_prefix.required' => 'Kode prefix wajib diisi.',
            'kode_prefix.unique' => 'Kode prefix sudah digunakan.',
            'kode_prefix.max' => 'Kode prefix maksimal 10 karakter.',
            'kode_prefix.alpha_dash' => 'Kode prefix hanya boleh mengandung huruf, angka, dan garis bawah.',
            'description.max' => 'Deskripsi maksimal 500 karakter.',
            'is_active.required' => 'Status kategori wajib dipilih.',
        ];

        $validated = $request->validate($rules, $messages);
        $validated['kode_prefix'] = strtoupper($validated['kode_prefix']);

        return $validated;
    }

    /**
     * Handle error responses.
     *
     * @param  \Exception  $e
     * @param  string  $action
     * @return \Illuminate\Http\RedirectResponse
     */
    private function handleError(\Exception $e, string $action)
    {
        return redirect()
            ->back()
            ->withInput()
            ->with('error', "Terjadi kesalahan saat {$action} kategori: " . $e->getMessage());
    }

    /**
     * Check if changing active status would affect products.
     *
     * @param  \App\Models\Category  $category
     * @param  bool  $newStatus
     * @throws \Exception
     */
    private function checkActiveStatusChange(Category $category, bool $newStatus)
    {
        if (!$newStatus && $category->is_active) {
            $activeProductsCount = $category->products()->where('is_active', true)->count();
            if ($activeProductsCount > 0) {
                throw new \Exception(
                    "Kategori ini memiliki {$activeProductsCount} produk aktif. " .
                    "Menonaktifkan kategori mungkin mempengaruhi tampilan produk di sistem."
                );
            }
        }
    }

    /**
     * Validate if category can be deleted.
     *
     * @param  \App\Models\Category  $category
     * @throws \Exception
     */
    private function validateCategoryDeletion(Category $category)
    {
        $category->loadCount('products');

        if ($category->products_count > 0) {
            throw new \Exception(
                "Tidak dapat menghapus kategori '{$category->name}' karena masih memiliki " .
                "{$category->products_count} produk terkait. Hapus atau pindahkan produk terlebih dahulu."
            );
        }

        $trashedProductsCount = $category->products()->onlyTrashed()->count();
        if ($trashedProductsCount > 0) {
            throw new \Exception(
                "Tidak dapat menghapus kategori '{$category->name}' karena masih memiliki " .
                "{$trashedProductsCount} produk yang dihapus sementara. " .
                "Hapus permanen produk tersebut terlebih dahulu."
            );
        }
    }

    /**
     * Check for conflicts before restoring a category.
     *
     * @param  \App\Models\Category  $category
     * @throws \Exception
     */
    private function checkRestoreConflicts(Category $category)
    {
        $existingCategory = Category::where('name', $category->name)
            ->orWhere('kode_prefix', $category->kode_prefix)
            ->first();
            
        if ($existingCategory) {
            throw new \Exception(
                'Tidak dapat memulihkan kategori karena nama atau kode prefix ' .
                'sudah digunakan oleh kategori lain.'
            );
        }
    }

    /**
     * Get category statistics for internal use.
     *
     * @return array
     */
    private function getCategoryStatistics()
    {
        return [
            'total' => Category::count(),
            'active' => Category::where('is_active', true)->count(),
            'with_products' => Category::has('products')->count(),
        ];
    }

    /**
     * Get categories data for reports.
     *
     * @return \Illuminate\Support\Collection
     */
    private function getReportCategories()
    {
        return Category::where('is_active', true)
            ->withCount(['products' => function ($query) {
                $query->where('is_active', true);
            }])
            ->with(['products' => function ($query) {
                $query->select('category_id', 
                    DB::raw('SUM(stock) as total_stock'), 
                    DB::raw('SUM(stock * purchase_price) as total_stock_value'))
                      ->where('is_active', true)
                      ->groupBy('category_id');
            }])
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                $stockData = $category->products->first();
                
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'kode_prefix' => $category->kode_prefix,
                    'description' => $category->description,
                    'products_count' => $category->products_count,
                    'total_stock' => $stockData->total_stock ?? 0,
                    'total_stock_value' => $stockData->total_stock_value ?? 0,
                    'created_at' => $category->created_at,
                    'updated_at' => $category->updated_at,
                ];
            });
    }

    /**
     * Get statistics data for categories.
     *
     * @return array
     */
    private function getStatisticsData()
    {
        // Basic category counts
        $totalCategories = Category::count();
        $activeCategories = Category::where('is_active', true)->count();
        $inactiveCategories = Category::where('is_active', false)->count();
        $trashedCategories = Category::onlyTrashed()->count();
        
        // Categories with/without products
        $categoriesWithProducts = Category::has('products')->count();
        $categoriesWithoutProducts = Category::doesntHave('products')->count();
        
        // Most popular categories by product count
        $topCategoriesByProducts = Category::withCount('products')
            ->where('is_active', true)
            ->orderByDesc('products_count')
            ->limit(5)
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'kode_prefix' => $category->kode_prefix,
                    'products_count' => $category->products_count,
                ];
            });

        // Categories by stock value
        $topCategoriesByValue = Category::with(['products' => function ($query) {
                $query->select('category_id', 
                    DB::raw('SUM(stock * purchase_price) as total_value'))
                      ->where('is_active', true)
                      ->groupBy('category_id');
            }])
            ->where('is_active', true)
            ->get()
            ->map(function ($category) {
                $stockData = $category->products->first();
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'kode_prefix' => $category->kode_prefix,
                    'total_value' => $stockData->total_value ?? 0,
                ];
            })
            ->sortByDesc('total_value')
            ->take(5)
            ->values();

        return [
            'summary' => [
                'total_categories' => $totalCategories,
                'active_categories' => $activeCategories,
                'inactive_categories' => $inactiveCategories,
                'trashed_categories' => $trashedCategories,
                'categories_with_products' => $categoriesWithProducts,
                'categories_without_products' => $categoriesWithoutProducts,
            ],
            'top_categories_by_products' => $topCategoriesByProducts,
            'top_categories_by_value' => $topCategoriesByValue,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Get JSON error response.
     *
     * @param  \Exception  $e
     * @param  string  $action
     * @return \Illuminate\Http\JsonResponse
     */
    private function jsonErrorResponse(\Exception $e, string $action)
    {
        return response()->json([
            'success' => false,
            'message' => "Terjadi kesalahan saat {$action}.",
            'error' => config('app.debug') ? $e->getMessage() : 'Server error'
        ], 500);
    }

    /**
     * Get data for export.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getExportData(Request $request)
    {
        return Category::withCount('products')
            ->when($request->get('active_only'), function ($query) {
                return $query->where('is_active', true);
            })
            ->orderBy('name')
            ->get();
    }

    /**
     * Process bulk action.
     *
     * @param  string  $action
     * @param  array  $categoryIds
     * @return int
     */
    private function processBulkAction(string $action, array $categoryIds)
    {
        $categories = Category::whereIn('id', $categoryIds)->get();
        $affectedCount = 0;

        foreach ($categories as $category) {
            switch ($action) {
                case 'activate':
                    if (!$category->is_active) {
                        $category->update(['is_active' => true]);
                        $affectedCount++;
                    }
                    break;
                
                case 'deactivate':
                    if ($category->is_active) {
                        $category->update(['is_active' => false]);
                        $affectedCount++;
                    }
                    break;
                
                case 'delete':
                    if ($category->products_count == 0) {
                        $category->delete();
                        $affectedCount++;
                    }
                    break;
            }
        }

        return $affectedCount;
    }

    /**
     * Get response for bulk action.
     *
     * @param  string  $action
     * @param  int  $count
     * @return \Illuminate\Http\RedirectResponse
     */
    private function bulkActionResponse(string $action, int $count)
    {
        $actionText = [
            'activate' => 'diaktifkan',
            'deactivate' => 'dinonaktifkan',
            'delete' => 'dihapus'
        ][$action];

        return redirect()
            ->back()
            ->with('success', "{$count} kategori berhasil {$actionText}.");
    }
}