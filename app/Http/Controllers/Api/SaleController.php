<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class SaleController extends Controller
{
public function index(Request $request)
{
    // Query dasar dengan eager loading
    $baseQuery = Sale::with(['user', 'items.product']);
    
    // Query untuk statistik (tanpa pagination)
    $statsQuery = (clone $baseQuery)
        ->when($request->search, function($q) use ($request) {
            $q->where(function($query) use ($request) {
                $query->where('invoice_number', 'like', '%'.$request->search.'%')
                      ->orWhere('customer_name', 'like', '%'.$request->search.'%');
            });
        })
        ->when($request->payment_method, function($q) use ($request) {
            $q->where('payment_method', $request->payment_method);
        });

    // Hitung statistik
    $stats = [
        'total_transactions' => $statsQuery->count(),
        'total_revenue' => $statsQuery->sum('total'),
        'today_transactions' => $statsQuery->whereDate('created_at', today())->count(),
        'today_revenue' => $statsQuery->whereDate('created_at', today())->sum('total'),
    ];

    // Hitung average transaction dengan pembagian yang aman
    $stats['average_transaction'] = $stats['total_transactions'] > 0 
        ? round($stats['total_revenue'] / $stats['total_transactions'])
        : 0;

    // Query untuk data pagination
    $sales = $baseQuery
        ->when($request->search, function($q) use ($request) {
            $q->where(function($query) use ($request) {
                $query->where('invoice_number', 'like', '%'.$request->search.'%')
                      ->orWhere('customer_name', 'like', '%'.$request->search.'%');
            });
        })
        ->when($request->payment_method, function($q) use ($request) {
            $q->where('payment_method', $request->payment_method);
        })
        ->latest()
        ->paginate(10);

    return Inertia::render('Sales/Index', [
        'sales' => $sales,
        'stats' => $stats,
        'filters' => $request->only(['search', 'payment_method']),
    ]);
}
    public function create()
    {
        $products = Product::select('id', 'name', 'code', 'selling_price', 'stock')
            ->where('stock', '>', 0)
            ->where('is_active', true)
            ->get()
            ->map(fn($product) => [
                ...$product->toArray(),
                'price_formatted' => number_format($product->selling_price, 0, ',', '.'),
            ]);

        return Inertia::render('Sales/Create', [
            'products' => $products,
        ]);
    }
public function store(Request $request)
{
    return DB::transaction(function () use ($request) {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'payment_method' => 'required|in:cash,debit,credit',
            'payment_amount' => 'required|numeric|min:0',
            'payment_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $total = collect($validated['items'])->sum(fn($item) =>
            $item['price'] * $item['quantity']
        );

        if ($validated['payment_amount'] < $total) {
            abort(422, 'Jumlah pembayaran kurang dari total belanja.');
        }

        // Buat invoice unik
        for ($i = 0; $i < 5; $i++) {
            $invoice = Sale::generateInvoiceNumber();
            if (!Sale::where('invoice_number', $invoice)->exists()) {
                break;
            }
            usleep(100000);
        }

        if (Sale::where('invoice_number', $invoice)->exists()) {
            abort(500, 'Gagal membuat nomor invoice unik. Silakan coba lagi.');
        }

        $sale = Sale::create([
            'invoice_number' => $invoice,
            'user_id' => auth()->id(),
            'customer_name' => $validated['customer_name'] ?? null,
            'total' => $total,
            'payment_amount' => $validated['payment_amount'],
            'change_amount' => $validated['payment_amount'] - $total,
            'payment_method' => $validated['payment_method'],
            'payment_date' => $validated['payment_date'] ?? now(), // ✅ perbaikan di sini
            'status' => 'completed',
        ]);

        foreach ($validated['items'] as $item) {
            $sale->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'subtotal' => $item['price'] * $item['quantity'],
            ]);

            Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
        }

        return redirect()->route('sales.show', $sale->id)
            ->with('success', 'Transaksi berhasil disimpan!');
    });
}


    public function show(Sale $sale)
    {
        $sale->load(['user', 'items.product']);

        return Inertia::render('Sales/Show', [
            'sale' => [
                ...$sale->toArray(),
                'cashier_name' => optional($sale->user)->name ?? 'Tidak diketahui',
                'total_formatted' => number_format($sale->total, 0, ',', '.'),
                'payment_amount_formatted' => number_format($sale->payment_amount, 0, ',', '.'),
                'change_amount_formatted' => number_format($sale->change_amount, 0, ',', '.'),
                'created_at_formatted' => optional($sale->created_at)->format('d/m/Y H:i'),
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
            'cashier_name' => optional($sale->user)->name ?? 'Tidak diketahui',
            'company' => [
                'name' => config('app.name'),
                'address' => 'Jl. Contoh No. 123, Kota Anda',
                'phone' => '(021) 12345678',
            ],
        ]);
    }

    public function downloadInvoice(Sale $sale)
    {
        $sale->load(['user', 'items.product']);

        $company = [
            'name' => 'Apotek Sehat',
            'address' => 'Jl. Sehat No. 123, Solo',
            'phone' => '08123456789',
        ];

        $pdf = Pdf::loadView('sales.invoice', compact('sale', 'company'))->setPaper('A4');

        return $pdf->download('Invoice-' . $sale->invoice_number . '.pdf');
    }
}