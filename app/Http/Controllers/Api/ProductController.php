<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Buat aturan validasi produk dinamis.
     */
    protected function getValidationRules($productId = null)
    {
        return [
            'code' => 'required|max:20|unique:products,code' . ($productId ? ',' . $productId : ''),
            'name' => 'required|max:100',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'purchase_price' => 'required|integer|min:0',
            'selling_price' => 'required|integer|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:1',
            'unit' => 'required|string|max:20',
            'entry_date' => 'nullable|date',
            'expired_date' => 'nullable|date|after_or_equal:entry_date',
            'image' => 'nullable|image|max:2048',
        ];
    }

    public function index()
    {
        $query = Product::with('category')
            ->when(request('search'), function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%$search%")
                        ->orWhere('code', 'like', "%$search%");
                });
            })
            ->when(request('category'), function ($q, $category) {
                $q->where('category_id', $category);
            })
            ->when(request('stock_status'), function ($q, $status) {
                $this->applyStockStatusFilter($q, $status);
            });

        $products = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Products/Index', [
            'auth' => [
                'user' => auth()->user()
            ],
            'products' => $products,
            'categories' => Category::all(),
            'filters' => request()->only(['search', 'category', 'stock_status']),
        ]);
    }

    protected function applyStockStatusFilter($query, $status)
    {
        switch ($status) {
            case 'in_stock':
                return $query->whereColumn('stock', '>', 'min_stock');
            case 'low_stock':
                return $query->whereColumn('stock', '<=', 'min_stock')->where('stock', '>', 0);
            case 'out_of_stock':
                return $query->where('stock', '<=', 0);
            default:
                return $query;
        }
    }

    public function expiredProducts(Request $request)
    {
        $query = Product::with('category')
            ->whereNotNull('expired_date')
            ->whereDate('expired_date', '<', Carbon::today())
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%$search%")
                        ->orWhere('code', 'like', "%$search%");
                });
            })
            ->when($request->category, function ($q, $category) {
                $q->where('category_id', $category);
            });

        $expiredProducts = $query->latest('expired_date')->paginate(10)->withQueryString();

        return Inertia::render('Products/Expired', [
            'expiredProducts' => $expiredProducts,
            'categories' => Category::all(),
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Products/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $this->getValidationRules());

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $validated['sold_quantity'] = 0;
        $validated['is_active'] = true;

        Product::create($validated);

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil ditambahkan!');
    }

    public function show(Product $product)
    {
        return Inertia::render('Products/Show', [
            'product' => $product->load('category'),
        ]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), $this->getValidationRules($product->id));

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil diperbarui!');
    }

    public function destroy(Product $product)
    {
        try {
            DB::beginTransaction();

            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $product->delete();

            DB::commit();

            return redirect()->route('products.index')
                ->with('success', 'Produk berhasil dihapus!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal menghapus produk: ' . $e->getMessage());
        }
    }

    public function search(Request $request)
    {
        $request->validate([
            'term' => 'nullable|string|max:100'
        ]);

        return Product::select('id', 'code', 'name', 'selling_price', 'stock')
            ->where('is_active', true)
            ->where(function ($query) use ($request) {
                $query->where('name', 'like', '%' . $request->term . '%')
                    ->orWhere('code', 'like', '%' . $request->term . '%');
            })
            ->orderBy('name')
            ->limit(10)
            ->get();
    }

    public function toggleStatus(Product $product)
    {
        $product->update(['is_active' => !$product->is_active]);

        return back()->with('success', 'Status produk berhasil diubah');
    }

    public function reports()
    {
        try {
            $totalProducts = Product::count();
            $totalStock = Product::sum('stock');
            $totalValue = Product::sum(DB::raw('stock * purchase_price'));

            $lowStockProducts = $this->getLowStockProducts();
            $outOfStockProducts = $this->getOutOfStockProducts();
            $soonExpiredProducts = $this->getSoonExpiredProducts();
            $bestSellingProducts = $this->getBestSellingProducts();
            $productsByCategory = $this->getProductsByCategory($totalProducts);

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'total_products' => $totalProducts,
                        'total_stock' => $totalStock,
                        'total_value' => $totalValue,
                        'low_stock_count' => $lowStockProducts->count(),
                        'out_of_stock_count' => $outOfStockProducts->count(),
                        'soon_expired_count' => $soonExpiredProducts->count(),
                    ],
                    'low_stock_products' => $lowStockProducts,
                    'out_of_stock_products' => $outOfStockProducts,
                    'best_selling_products' => $bestSellingProducts,
                    'products_by_category' => $productsByCategory,
                    'soon_expired_products' => $soonExpiredProducts,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memuat laporan produk.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    protected function getLowStockProducts()
    {
        return Product::with('category')
            ->whereColumn('stock', '<=', 'min_stock')
            ->where('stock', '>', 0)
            ->get()
            ->map(fn ($product) => $this->formatProductReport($product));
    }

    protected function getOutOfStockProducts()
    {
        return Product::with('category')
            ->where('stock', '<=', 0)
            ->get()
            ->map(fn ($product) => $this->formatProductReport($product));
    }

    protected function getSoonExpiredProducts()
    {
        return Product::with('category')
            ->whereNotNull('expired_date')
            ->whereDate('expired_date', '>', Carbon::today())
            ->whereDate('expired_date', '<=', Carbon::today()->addDays(30))
            ->get()
            ->map(function ($product) {
                $data = $this->formatProductReport($product);
                $data['expired_date'] = $product->expired_date;
                $data['days_to_expire'] = Carbon::today()->diffInDays($product->expired_date);
                return $data;
            });
    }

    protected function getBestSellingProducts()
    {
        $bestSellingFromSales = SaleItem::select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->with(['product.category'])
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get()
            ->map(fn ($item) => $item->product ? $this->formatProductReport($item->product, $item->total_sold) : null)
            ->filter();

        if ($bestSellingFromSales->isNotEmpty()) {
            return $bestSellingFromSales;
        }

        return Product::with('category')
            ->where('sold_quantity', '>', 0)
            ->orderByDesc('sold_quantity')
            ->limit(10)
            ->get()
            ->map(fn ($product) => $this->formatProductReport($product, $product->sold_quantity));
    }

    protected function getProductsByCategory($totalProducts)
    {
        return Category::query()
            ->withCount('products')
            ->with(['products' => function ($q) {
                $q->select('category_id')
                    ->selectRaw('SUM(stock) as stock_sum')
                    ->selectRaw('SUM(stock * purchase_price) as value_sum')
                    ->groupBy('category_id');
            }])
            ->get()
            ->map(function ($category) use ($totalProducts) {
                $stockSum = $category->products->sum('stock_sum') ?? 0;
                $valueSum = $category->products->sum('value_sum') ?? 0;

                return [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'product_count' => $category->products_count,
                    'percentage' => $totalProducts > 0 ? round(($category->products_count / $totalProducts) * 100, 2) : 0,
                    'stock' => $stockSum,
                    'total_value' => $valueSum,
                ];
            })
            ->filter(fn ($item) => $item['product_count'] > 0);
    }

    protected function formatProductReport($product, $soldQuantity = null)
    {
        return [
            'id' => $product->id,
            'code' => $product->code,
            'name' => $product->name,
            'category_name' => $product->category->name ?? '-',
            'current_stock' => $product->stock,
            'min_stock' => $product->min_stock,
            'selling_price' => $product->selling_price,
            'total_sold' => $soldQuantity ?? $product->sold_quantity,
        ];
    }
}
