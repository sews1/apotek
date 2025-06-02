<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index()
    {
        $filters = request()->only('search', 'trashed');
        $query = Category::query()->withCount('products');

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('kode_prefix', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['trashed'])) {
            if ($filters['trashed'] === 'with') {
                $query->withTrashed();
            } elseif ($filters['trashed'] === 'only') {
                $query->onlyTrashed();
            }
        }

        $categories = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('Categories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:categories|max:50',
            'kode_prefix' => 'required|string|max:10|unique:categories,kode_prefix',
            'description' => 'nullable|string|max:255',
            'is_active' => 'required|boolean',
        ]);

        Category::create($validated);

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil ditambahkan!');
    }

    public function edit(Category $category)
    {
        $category->loadCount('products');

        return Inertia::render('Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|max:50|unique:categories,name,' . $category->id,
            'kode_prefix' => 'required|string|max:10|unique:categories,kode_prefix,' . $category->id,
            'description' => 'nullable|string|max:255',
            'is_active' => 'required|boolean',
        ]);

        $category->update($validated);

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil diperbarui!');
    }

    public function destroy(Category $category)
    {
        $category->loadCount('products');

        if ($category->products_count > 0) {
            return back()->with('error', 'Tidak dapat menghapus kategori karena terdapat ' . $category->products_count . ' produk terkait!');
        }

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus!');
    }

    public function restore($id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        return back()->with('success', 'Kategori berhasil dipulihkan!');
    }

    /**
     * Get categories for reports or API usage
     */
    public function getForReports()
    {
        try {
            $categories = Category::where('is_active', true)
                ->withCount(['products' => function ($query) {
                    $query->where('is_active', true);
                }])
                ->with(['products' => function ($query) {
                    $query->select('category_id', DB::raw('SUM(stock) as total_stock'), DB::raw('SUM(stock * purchase_price) as total_stock_value'))
                          ->where('is_active', true)
                          ->groupBy('category_id');
                }])
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
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memuat data kategori.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category statistics for dashboard
     */
    public function statistics()
    {
        try {
            $totalCategories = Category::count();
            $activeCategories = Category::where('is_active', true)->count();
            $categoriesWithProducts = Category::has('products')->count();
            $categoriesWithoutProducts = Category::doesntHave('products')->count();

            // Top categories by product count
            $topCategories = Category::withCount('products')
                ->orderByDesc('products_count')
                ->limit(5)
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'products_count' => $category->products_count,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'total_categories' => $totalCategories,
                        'active_categories' => $activeCategories,
                        'categories_with_products' => $categoriesWithProducts,
                        'categories_without_products' => $categoriesWithoutProducts,
                    ],
                    'top_categories' => $topCategories,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memuat statistik kategori.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function share(Request $request)
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'roles' => $request->user()->roles->pluck('name'), // pastikan ada
                ] : null,
            ],
        ]);
    }

}