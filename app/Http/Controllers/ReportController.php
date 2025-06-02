<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
  public function index()
{
    // Ambil data penjualan untuk weekly, monthly, yearly
    $weeklySales = $this->getWeeklySales();
    $monthlySales = $this->getMonthlySales();
    $yearlySales = $this->getYearlySales();

    // Ambil data produk dengan kategori terkait (eager loading)
    $products = Product::with('category')->get();
    $categories = Category::all();

    // Return view Inertia dengan data lengkap
    return Inertia::render('ProductReport', [
        'weeklySales' => $weeklySales ?: [],
        'monthlySales' => $monthlySales ?: [],
        'yearlySales' => $yearlySales ?: [],
        'products' => $products ?: [],
        'categories' => $categories ?: [],
    ]);
}



    public function weekly(Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->startOfWeek();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : Carbon::now()->endOfWeek();

        return Inertia::render('Reports/Weekly', [
            'weeklySales' => $this->getWeeklySales($startDate, $endDate),
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    public function monthly(Request $request)
    {
        $month = $request->input('month') ?? now()->month;
        $year = $request->input('year') ?? now()->year;

        return Inertia::render('Reports/Monthly', [
            'monthlySales' => $this->getMonthlySales($month, $year),
            'filters' => [
                'month' => $month,
                'year' => $year,
            ],
        ]);
    }

    public function yearly(Request $request)
    {
        $year = $request->input('year') ?? now()->year;

        return Inertia::render('Reports/Yearly', [
            'yearlySales' => $this->getYearlySales($year),
            'filters' => [
                'year' => $year,
            ],
        ]);
    }

    public function product(Request $request)
{
    try {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $categoryId = $request->input('category_id');

        // Ambil semua produk (filter berdasarkan kategori jika ada)
        $products = Product::with('category')
            ->when($categoryId, fn($q) => $q->where('category_id', $categoryId))
            ->get();

        // Ambil penjualan berdasarkan produk
        $salesQuery = Sale::with(['items.product']);

        if ($startDate && $endDate) {
            $salesQuery->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
        }

        $sales = $salesQuery->get();

        // Ambil semua item penjualan lalu group berdasarkan produk
        $salesItems = $sales->flatMap(fn($sale) => $sale->items)
            ->groupBy('product_id');

        // Gabungkan semua data produk dengan data penjualannya
        $productSales = $products->map(function ($product) use ($salesItems) {
            $items = $salesItems->get($product->id, collect());

            return [
                'product_id' => $product->id,
                'product_code' => $product->code ?? '-',
                'product_name' => $product->name,
                'category_id' => $product->category_id,
                'category_name' => $product->category->name ?? '-',
                'current_stock' => (int) $product->stock,
                'total_quantity_sold' => $items->sum('quantity'),
                'total_revenue' => $items->sum('subtotal'),
                'purchase_price' => (float) $product->purchase_price,
                'selling_price' => (float) $product->selling_price,
            ];
        });

        $categories = Category::where('is_active', true)->get();

        $summary = [
            'total_products' => $productSales->count(),
            'total_quantity_sold' => $productSales->sum('total_quantity_sold'),
            'total_revenue' => $productSales->sum('total_revenue'),
            'total_stock_value' => $productSales->sum(fn($item) => $item['current_stock'] * $item['purchase_price']),
        ];

        return Inertia::render('Reports/Product', [
            'productSales' => $productSales,
            'categories' => $categories,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'category_id' => $categoryId,
            ],
        ]);
    } catch (\Exception $e) {
        \Log::error('Error in product report: ' . $e->getMessage());

        return Inertia::render('Reports/Product', [
            'productSales' => collect([]),
            'categories' => Category::where('is_active', true)->get(),
            'summary' => [
                'total_products' => 0,
                'total_quantity_sold' => 0,
                'total_revenue' => 0,
                'total_stock_value' => 0,
            ],
            'filters' => [
                'start_date' => null,
                'end_date' => null,
                'category_id' => null,
            ],
            'error' => 'Terjadi kesalahan saat memuat data laporan produk.',
        ]);
    }
}


    public function supplier(Request $request)
    {
        try {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            $salesQuery = Sale::with('items.product.supplier');

            if ($startDate && $endDate) {
                $salesQuery->whereBetween('created_at', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay()
                ]);
            }

            $sales = $salesQuery->get();

            $supplierSales = $sales->flatMap(fn($sale) => $sale->items)
                ->filter(fn($item) => $item->product && $item->product->supplier)
                ->groupBy(fn($item) => $item->product->supplier->id)
                ->map(function ($items, $supplierId) {
                    $supplier = $items->first()->product->supplier;

                    return [
                        'supplier_id' => $supplierId,
                        'supplier_name' => $supplier->name,
                        'supplier_contact' => $supplier->contact ?? '-',
                        'total_products' => $items->groupBy('product_id')->count(),
                        'total_quantity_sold' => $items->sum('quantity'),
                        'total_revenue' => $items->sum('subtotal'),
                    ];
                })
                ->values();

            $summary = [
                'total_suppliers' => $supplierSales->count(),
                'total_quantity_sold' => $supplierSales->sum('total_quantity_sold'),
                'total_revenue' => $supplierSales->sum('total_revenue'),
            ];

            return Inertia::render('Reports/Supplier', [
                'supplierSales' => $supplierSales,
                'summary' => $summary,
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in supplier report: ' . $e->getMessage());

            return Inertia::render('Reports/Supplier', [
                'supplierSales' => collect([]),
                'summary' => [
                    'total_suppliers' => 0,
                    'total_quantity_sold' => 0,
                    'total_revenue' => 0,
                ],
                'filters' => [
                    'start_date' => null,
                    'end_date' => null,
                ],
                'error' => 'Terjadi kesalahan saat memuat data laporan supplier.',
            ]);
        }
    }

    // ---------------- PRIVATE HELPERS ---------------- //

    private function getWeeklySales(Carbon $startDate = null, Carbon $endDate = null)
    {
        $startDate = $startDate ?? Carbon::now()->startOfWeek();
        $endDate = $endDate ?? Carbon::now()->endOfWeek();

        return Sale::with(['items.product'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($sale) => [
                'date' => $sale->created_at->format('Y-m-d'),
                'invoice' => $sale->invoice_number,
                'customer' => $sale->customer_name,
                'total' => (float) $sale->total,
                'items' => $sale->items->map(fn($item) => [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name ?? '-',
                    'quantity' => (int) $item->quantity,
                    'price' => (float) $item->price,
                    'subtotal' => (float) $item->subtotal,
                ]),
            ]);
    }

    private function getMonthlySales($month = null, $year = null)
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        return Sale::with(['items.product'])
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($sale) => [
                'date' => $sale->created_at->format('Y-m-d'),
                'invoice' => $sale->invoice_number,
                'customer' => $sale->customer_name,
                'total' => (float) $sale->total,
                'items' => $sale->items->map(fn($item) => [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name ?? '-',
                    'quantity' => (int) $item->quantity,
                    'price' => (float) $item->price,
                    'subtotal' => (float) $item->subtotal,
                ]),
            ]);
    }

    private function getYearlySales($year = null)
    {
        $year = $year ?? now()->year;

        return Sale::with(['items.product'])
            ->whereYear('created_at', $year)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($sale) => [
                'date' => $sale->created_at->format('Y-m-d'),
                'invoice' => $sale->invoice_number,
                'customer' => $sale->customer_name,
                'total' => (float) $sale->total,
                'items' => $sale->items->map(fn($item) => [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name ?? '-',
                    'quantity' => (int) $item->quantity,
                    'price' => (float) $item->price,
                    'subtotal' => (float) $item->subtotal,
                ]),
            ]);
    }

}
