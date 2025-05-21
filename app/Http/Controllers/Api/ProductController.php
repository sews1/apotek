<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class ProductController extends Controller
{
    public function index()
    {
        $stockStatus = request('stock_status');
        $query = Product::with('category');

        if ($search = request('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('code', 'like', "%$search%");
            });
        }

        if ($category = request('category')) {
            $query->where('category_id', $category);
        }

        if ($stockStatus) {
            $query->where(function ($q) use ($stockStatus) {
                if ($stockStatus === 'in_stock') {
                    $q->whereColumn('stock', '>', 'min_stock');
                } elseif ($stockStatus === 'low_stock') {
                    $q->whereColumn('stock', '<=', 'min_stock')->where('stock', '>', 0);
                } elseif ($stockStatus === 'out_of_stock') {
                    $q->where('stock', '<=', 0);
                }
            });
        }

        $products = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => Category::all(),
            'filters' => request()->only(['search', 'category', 'stock_status']),
        ]);
    }

    public function expiredProducts(Request $request)
    {
        $query = Product::with('category')
            ->whereNotNull('expired_date')
            ->whereDate('expired_date', '<', Carbon::today());

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('code', 'like', "%$search%");
            });
        }

        if ($category = $request->input('category')) {
            $query->where('category_id', $category);
        }

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
        $validated = $request->validate([
            'code' => 'required|unique:products|max:20',
            'name' => 'required|max:100',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:1',
            'unit' => 'required|string|max:20',
            'entry_date' => 'nullable|date',
            'expired_date' => 'nullable|date|after_or_equal:entry_date',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        Product::create($validated);

        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan!');
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
        $validated = $request->validate([
            'code' => 'required|max:20|unique:products,code,' . $product->id,
            'name' => 'required|max:100',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:1',
            'unit' => 'required|string|max:20',
            'entry_date' => 'nullable|date',
            'expired_date' => 'nullable|date|after_or_equal:entry_date',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui!');
    }

    public function destroy(Product $product)
    {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('products.index')->with('success', 'Produk berhasil dihapus!');
    }

    public function search(Request $request)
    {
        $term = $request->input('term', '');
        return Product::select('id', 'code', 'name', 'selling_price', 'stock')
            ->where('name', 'like', '%' . $term . '%')
            ->orWhere('code', 'like', '%' . $term . '%')
            ->limit(10)
            ->get();
    }

    public function getLastCode(Request $request)
    {
        $categoryId = $request->get('category_id');

        if (!$categoryId) {
            return response()->json(['error' => 'Category ID is required'], 400);
        }

        $category = Category::find($categoryId);

        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        $prefix = $this->getPrefixByCategory($category->name);

        $lastProduct = Product::where('code', 'like', "$prefix%")
            ->orderByDesc('code')
            ->first();

        if ($lastProduct && preg_match('/(\d+)$/', $lastProduct->code, $matches)) {
            $number = (int)$matches[1] + 1;
        } else {
            $number = 1;
        }

        $newCode = sprintf('%s%04d', $prefix, $number);

        return response()->json(['code' => $newCode]);
    }

    private function getPrefixByCategory(string $categoryName): string
    {
        return match ($categoryName) {
            'Obat Bebas' => 'OBB',
            'Obat Bebas Terbatas' => 'OBT',
            'Obat Keras' => 'OBK',
            'Alat Kesehatan' => 'ALK',
            'Perawatan Tubuh' => 'PRT',
            default => 'PRD',
        };
    }
}
