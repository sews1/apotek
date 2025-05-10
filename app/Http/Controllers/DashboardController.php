<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with statistics.
     */
    public function index()
    {
        // Hitung statistik dasar
        $stats = [
            'total_products' => Product::count(),
            'low_stock_products' => Product::whereColumn('stock', '<', 'min_stock')->count(),
            'today_sales' => Sale::whereDate('created_at', today())->count(),
            'today_revenue' => Sale::whereDate('created_at', today())->sum('total_amount'),
            'monthly_revenue' => Sale::whereMonth('created_at', now()->month)
                                ->whereYear('created_at', now()->year)
                                ->sum('total_amount'),
        ];

        // Ambil 5 penjualan terakhir
        $recent_sales = Sale::with(['items.product', 'user'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($sale) {
                return [
                    'invoice' => $sale->invoice_number,
                    'customer' => $sale->customer_name ?? 'Pelanggan Umum',
                    'total' => number_format($sale->total_amount, 0, ',', '.'),
                    'date' => $sale->created_at->format('d M Y H:i'),
                    'cashier' => $sale->user->name,
                    'items' => $sale->items->map(function ($item) {
                        return [
                            'name' => $item->product->name,
                            'quantity' => $item->quantity,
                            'price' => number_format($item->price, 0, ',', '.'),
                        ];
                    })
                ];
            });

        // Ambil 5 produk stok rendah
        $low_stock_items = Product::with(['category'])
            ->whereColumn('stock', '<', 'min_stock')
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'code' => $product->code,
                    'stock' => $product->stock,
                    'min_stock' => $product->min_stock,
                    'unit' => $product->unit,
                    'category' => $product->category->name,
                ];
            });

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'recentSales' => $recent_sales,
            'lowStockItems' => $low_stock_items,
            'chartData' => $this->getSalesChartData()
        ]);
    }

    /**
     * Generate sales data for the last 30 days for chart
     */
    private function getSalesChartData()
    {
        $salesData = Sale::selectRaw('DATE(created_at) as date, SUM(total_amount) as total')
            ->whereBetween('created_at', [now()->subDays(30), now()])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Format untuk chart
        return [
            'labels' => $salesData->pluck('date')->map(function ($date) {
                return \Carbon\Carbon::parse($date)->format('d M');
            }),
            'datasets' => [
                [
                    'label' => 'Penjualan 30 Hari Terakhir',
                    'data' => $salesData->pluck('total'),
                    'backgroundColor' => '#4F46E5',
                    'borderColor' => '#3730A3',
                ]
            ]
        ];
    }
}