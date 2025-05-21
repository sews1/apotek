<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with statistics.
     */
    public function index()
    {
        $today = Carbon::today();
        $now = Carbon::now();

        // Statistik Utama
        $stats = [
            'total_products' => Product::count(),
            'low_stock_products' => Product::whereColumn('stock', '<', 'min_stock')->count(),
            'today_sales' => Sale::whereDate('created_at', $today)->count(),
            'today_revenue' => Sale::whereDate('created_at', $today)->sum('total'),
            'monthly_revenue' => Sale::whereMonth('created_at', $now->month)
                                     ->whereYear('created_at', $now->year)
                                     ->sum('total'),
            'near_expired_products' => Product::whereDate('expired_date', '<=', $now->addDays(30))
                                              ->whereDate('expired_date', '>=', $today)
                                              ->count(),
        ];

        // Penjualan Terakhir (5 terbaru)
        $recent_sales = Sale::with(['items.product', 'user'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($sale) {
                return [
                    'invoice'   => $sale->invoice_number,
                    'customer'  => $sale->customer_name ?? 'Pelanggan Umum',
                    'total'     => number_format($sale->total, 0, ',', '.'),
                    'date'      => optional($sale->created_at)->format('d M Y H:i'),
                    'cashier'   => $sale->user->name ?? '-',
                    'items'     => $sale->items->map(function ($item) {
                        return [
                            'name'     => $item->product->name ?? '-',
                            'quantity' => $item->quantity,
                            'price'    => number_format($item->price, 0, ',', '.'),
                        ];
                    })
                ];
            });

        // Produk Stok Rendah (5 terbawah)
        $low_stock_items = Product::with('category')
            ->whereColumn('stock', '<', 'min_stock')
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id'        => $product->id,
                    'name'      => $product->name,
                    'code'      => $product->code,
                    'stock'     => $product->stock,
                    'min_stock' => $product->min_stock,
                    'unit'      => $product->unit,
                    'category'  => $product->category->name ?? '-',
                ];
            });

        // Produk Hampir Kadaluwarsa (5 teratas, dalam 30 hari ke depan)
        $near_expired_items = Product::with('category')
            ->whereDate('expired_date', '<=', $now->copy()->addDays(30))
            ->whereDate('expired_date', '>=', $today)
            ->orderBy('expired_date', 'asc')
            ->take(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id'           => $product->id,
                    'name'         => $product->name,
                    'code'         => $product->code,
                    'expired_date' => $product->expired_date->format('d M Y'),
                    'category'     => $product->category->name ?? '-',
                ];
            });

        // Grafik Penjualan 30 Hari Terakhir
        $chartData = $this->getSalesChartData();

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'recentSales' => $recent_sales,
            'lowStockItems' => $low_stock_items,
            'nearExpiredItems' => $near_expired_items,  // kirim data produk hampir kadaluwarsa ke frontend
            'chartData' => $chartData,
        ]);
    }

    /**
     * Generate sales data for the last 30 days for chart
     */
    private function getSalesChartData()
    {
        $startDate = now()->subDays(29)->startOfDay();
        $endDate = now()->endOfDay();

        $sales = Sale::selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $labels = [];
        $totals = [];

        for ($i = 0; $i < 30; $i++) {
            $date = now()->subDays(29 - $i)->format('Y-m-d');
            $labels[] = Carbon::parse($date)->format('d M');
            $totals[] = $sales[$date]->total ?? 0;
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Penjualan 30 Hari Terakhir',
                    'data' => $totals,
                    'backgroundColor' => '#4F46E5',
                    'borderColor' => '#3730A3',
                    'borderWidth' => 1,
                ]
            ]
        ];
    }
}
