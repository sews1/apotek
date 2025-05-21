<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::filter(request()->only('search', 'trashed'))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'filters' => request()->all('search', 'trashed'),
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
            'slug' => 'required|unique:categories|max:50',
            'kode_prefix' => 'required|string|max:10',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Category::create($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Kategori berhasil ditambahkan!');
    }

    public function edit(Category $category)
    {
        return Inertia::render('Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|max:50|unique:categories,name,' . $category->id,
            'kode_prefix' => 'required|string|max:10|unique:categories,kode_prefix,' . $category->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Kategori berhasil diperbarui!');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->exists()) {
            return back()
                ->with('error', 'Tidak dapat menghapus kategori karena terdapat produk terkait!');
        }

        $category->delete();

        return back()
            ->with('success', 'Kategori berhasil dihapus!');
    }

    public function restore($id)
    {
        Category::withTrashed()
            ->findOrFail($id)
            ->restore();

        return back()
            ->with('success', 'Kategori berhasil dipulihkan!');
    }
}
