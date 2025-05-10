<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index()
    {
        $sales = Sale::with(['user', 'items.product'])
            ->filter(request()->only('search', 'date', 'status'))
            ->latest()
            ->paginate(10);

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'filters' => request()->all('search', 'date', 'status'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Sales/Create', [
            'products' => Product::select('id', 'name', 'code', 'selling_price', 'stock')
                ->where('stock', '>', 0)
                ->get()
                ->map(fn($product) => [
                    ...$product->toArray(),
                    'price_formatted' => number_format($product->selling_price, 0, ',', '.'),
                ]),
        ]);
    }

    public function store(Request $request)
    {
        // return DB::transaction(function () use ($request) {
        //     // Mengubah validasi agar customer_name dan customer_phone tidak wajib
        //     $validated = $request->validate([
        //         'customer_name' => 'nullable|string|max:255', // Menjadikan customer_name opsional
        //         'customer_phone' => 'nullable|string|max:20',  // Menjadikan customer_phone opsional
        //         'payment_method' => 'required|in:cash,debit,credit',
        //         'payment_amount' => 'required|numeric|min:0',
        //         'items' => 'required|array|min:1',
        //         'items.*.product_id' => 'required|exists:products,id',
        //         'items.*.quantity' => 'required|integer|min:1',
        //         'items.*.price' => 'required|numeric|min:0',
        //         'notes' => 'nullable|string',
        //     ]);
    
        //     $total = collect($validated['items'])->sum(fn($item) => $item['price'] * $item['quantity']);
    
        //     // Validasi manual: payment >= total
        //     if ($validated['payment_amount'] < $total) {
        //         abort(422, 'Jumlah pembayaran kurang dari total belanja.');
        //     }
    
        //     $sale = Sale::create([
        //         'invoice_number' => Sale::generateInvoiceNumber(),
        //         'user_id' => auth()->id(),
        //         'customer_name' => $validated['customer_name'] ?? null,  // Jika kosong, simpan null
        //         'customer_phone' => $validated['customer_phone'] ?? null, // Jika kosong, simpan null
        //         'total' => $total,
        //         'total_amount' => $total, // Pastikan kolom total_amount tetap ada
        //         'payment_amount' => $validated['payment_amount'],
        //         'change_amount' => $validated['payment_amount'] - $total,
        //         'payment_method' => $validated['payment_method'],
        //         'status' => 'completed',
        //         'notes' => $validated['notes'] ?? null,
        //     ]);
    
        //     foreach ($validated['items'] as $item) {
        //         $sale->items()->create([
        //             'product_id' => $item['product_id'],
        //             'quantity' => $item['quantity'],
        //             'price' => $item['price'],
        //             'subtotal' => $item['price'] * $item['quantity'],
        //         ]);
    
        //         Product::where('id', $item['product_id'])
        //             ->decrement('stock', $item['quantity']);
        //     }
    
        //     return redirect()->route('sales.show', $sale)
        //         ->with('success', 'Transaksi berhasil disimpan!');
        // });
        $validated = $request->validate([
            // 'id' => 'required|unique:products|max:20',
            'invoice_number' => 'required|string|max:100',
            'user_id' => 'required|string|max:100',
            'customer_name' => 'nullable|string',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'payment_amount' => 'required|numeric|min:0',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('sales', 'public');
        }

        Sale::create($validated);

        return redirect()->route('sales.index')->with('success', 'Produk berhasil ditambahkan!');
    }
    


    public function show(Sale $sale)
    {
        $sale->load(['user', 'items.product']);

        return Inertia::render('Sales/Show', [
            'sale' => [
                ...$sale->toArray(),
                'total_formatted' => number_format($sale->total, 0, ',', '.'),
                'payment_amount_formatted' => number_format($sale->payment_amount, 0, ',', '.'),
                'change_amount_formatted' => number_format($sale->change_amount, 0, ',', '.'),
                'created_at_formatted' => $sale->created_at->format('d/m/Y H:i'),
                'items' => $sale->items->map(fn($item) => [
                    ...$item->toArray(),
                    'price_formatted' => number_format($item->price, 0, ',', '.'),
                    'subtotal_formatted' => number_format($item->subtotal, 0, ',', '.'),
                    'product_name' => $item->product->name,
                    'product_code' => $item->product->code,
                ]),
            ],
        ]);
    }

    public function invoice(Sale $sale)
    {
        $sale->load(['user', 'items.product']);

        return view('prints.invoice', [
            'sale' => $sale,
            'company' => [
                'name' => config('app.name'),
                'address' => 'Jl. Contoh No. 123, Kota Anda',
                'phone' => '(021) 12345678',
            ],
        ]);
    }
}
