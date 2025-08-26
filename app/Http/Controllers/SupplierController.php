<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
{
    $suppliers = Supplier::query()
        ->when($request->search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('item', 'like', "%{$search}%");
            });
        })
        ->latest()
        ->paginate(10); // Pastikan ini mengembalikan Paginator instance

    return Inertia::render('Suppliers/Index', [
        'suppliers' => $suppliers, // Paginator instance sudah memiliki method map
        'filters' => $request->only(['search']),
    ]);
}

    public function create()
    {
        return Inertia::render('Suppliers/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'item' => 'required|string|max:255', // Diubah menjadi required
        ]);

        Supplier::create($validated);

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function show(Supplier $supplier)
    {
        return Inertia::render('Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    public function edit(Supplier $supplier)
    {
        return Inertia::render('Suppliers/Edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'item' => 'required|string|max:255', 
        ]);

        $supplier->update($validated);

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier berhasil diperbarui.');
    }

    public function destroy(Supplier $supplier)
    {
        // Tambahkan pengecekan jika supplier memiliki relasi sebelum dihapus
        try {
            $supplier->delete();
            return redirect()->route('suppliers.index')
                ->with('success', 'Supplier berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->route('suppliers.index')
                ->with('error', 'Gagal menghapus supplier. Mungkin memiliki data terkait.');
        }
    }
}