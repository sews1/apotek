<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
        return Product::select('id', 'code', 'name', 'selling_price', 'stock')
            ->where('name', 'like', '%' . $request->term . '%')
            ->orWhere('code', 'like', '%' . $request->term . '%')
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

        // Buat prefix dari nama kategori, misalnya: "OBB" untuk Obat Bebas
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $category->name), 0, 3));

        $lastProduct = Product::where('code', 'like', "$prefix-%")
                        ->orderByDesc('id')
                        ->first();

        if ($lastProduct && preg_match('/\d+$/', $lastProduct->code, $matches)) {
            $number = (int)$matches[0] + 1;
        } else {
            $number = 1;
        }

        $newCode = sprintf('%s-%03d', $prefix, $number);

        return response()->json(['code' => $newCode]);
    }
}
