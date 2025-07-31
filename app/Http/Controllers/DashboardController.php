<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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
            'monthly_sales' => Sale::whereMonth('created_at', $now->month)
                                   ->whereYear('created_at', $now->year)
                                   ->count(),
            'yearly_revenue' => Sale::whereYear('created_at', $now->year)->sum('total'),
            'yearly_sales' => Sale::whereYear('created_at', $now->year)->count(),
            'near_expired_products' => Product::whereDate('expired_date', '<=', $now->copy()->addDays(30))
                                              ->whereDate('expired_date', '>=', $today)
                                              ->count(),
        ];

        // Penjualan Terakhir (10 terbaru) dengan format yang benar
        $recent_sales = Sale::with(['items.product', 'user'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($sale) {
                return [
                    'id'        => $sale->id,
                    'invoice'   => $sale->invoice_number,
                    'customer'  => $sale->customer_name ?? 'Pelanggan Umum',
                    'total'     => (float) $sale->total, // Pastikan numeric
                    'date'      => $sale->created_at->format('Y-m-d H:i:s'), // Format konsisten
                    'cashier'   => $sale->user->name ?? '-',
                    'items_count' => $sale->items->count(),
                    'items'     => $sale->items->map(function ($item) {
                        return [
                            'name'     => $item->product->name ?? '-',
                            'quantity' => $item->quantity,
                            'price'    => (float) $item->price,
                            'subtotal' => (float) ($item->quantity * $item->price),
                        ];
                    })
                ];
            });

        // Produk Stok Rendah (10 terbawah)
        $low_stock_items = Product::with('category')
            ->whereColumn('stock', '<', 'min_stock')
            ->orderBy('stock', 'asc')
            ->take(10)
            ->get()
            ->map(function ($product) {
                return [
                    'id'        => $product->id,
                    'name'      => $product->name,
                    'code'      => $product->code,
                    'stock'     => (int) $product->stock,
                    'min_stock' => (int) $product->min_stock,
                    'unit'      => $product->unit,
                    'category'  => $product->category->name ?? '-',
                    'price'     => (float) $product->selling_price,
                ];
            });

        // Produk Hampir Kadaluwarsa (10 teratas, dalam 30 hari ke depan)
        $near_expired_items = Product::with('category')
            ->whereDate('expired_date', '<=', $now->copy()->addDays(30))
            ->whereDate('expired_date', '>=', $today)
            ->orderBy('expired_date', 'asc')
            ->take(10)
            ->get()
            ->map(function ($product) {
                $daysUntilExpiry = Carbon::parse($product->expired_date)->diffInDays(Carbon::today());
                return [
                    'id'           => $product->id,
                    'name'         => $product->name,
                    'code'         => $product->code,
                    'stock'        => (int) $product->stock,
                    'unit'         => $product->unit,
                    'expired_date' => Carbon::parse($product->expired_date)->format('d M Y'),
                    'days_until_expiry' => $daysUntilExpiry,
                    'category'     => $product->category->name ?? '-',
                    'urgency'      => $daysUntilExpiry <= 7 ? 'critical' : ($daysUntilExpiry <= 14 ? 'warning' : 'caution'),
                ];
            });

        // Produk Terlaris (berdasarkan quantity terjual dalam 30 hari terakhir)
        $top_products = DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->select(
                'products.id',
                'products.name',
                'products.code',
                'categories.name as category',
                DB::raw('SUM(sale_items.quantity) as total_sold'),
                DB::raw('SUM(sale_items.quantity * sale_items.price) as total_revenue')
            )
            ->where('sales.created_at', '>=', $now->copy()->subDays(30))
            ->groupBy('products.id', 'products.name', 'products.code', 'categories.name')
            ->orderBy('total_sold', 'desc')
            ->take(10)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'code' => $product->code,
                    'category' => $product->category ?? 'Tanpa Kategori',
                    'total_sold' => (int) $product->total_sold,
                    'total_revenue' => (float) $product->total_revenue,
                ];
            });

        // Grafik Penjualan 30 Hari Terakhir
        $chartData = $this->getSalesChartData();

        // Ringkasan Tahunan untuk grafik garis
        $yearlySummary = $this->getYearlySummary($now->year);

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'recentSales' => $recent_sales,
            'lowStockItems' => $low_stock_items,
            'nearExpiredItems' => $near_expired_items,
            'topProducts' => $top_products,
            'chartData' => $chartData,
            'yearlySummary' => $yearlySummary,
        ]);
    }

    /**
     * Generate sales data for the last 30 days for chart
     */
    private function getSalesChartData()
    {
        $startDate = now()->subDays(29)->startOfDay();
        $endDate = now()->endOfDay();

        $sales = Sale::selectRaw('DATE(created_at) as date, SUM(total) as total, COUNT(*) as count')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $labels = [];
        $totals = [];
        $counts = [];

        for ($i = 0; $i < 30; $i++) {
            $date = now()->subDays(29 - $i)->format('Y-m-d');
            $labels[] = Carbon::parse($date)->format('d M');
            $totals[] = isset($sales[$date]) ? (float) $sales[$date]->total : 0;
            $counts[] = isset($sales[$date]) ? (int) $sales[$date]->count : 0;
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Pendapatan Harian (Rp)',
                    'data' => $totals,
                    'backgroundColor' => 'rgba(79, 70, 229, 0.8)',
                    'borderColor' => 'rgba(55, 48, 163, 1)',
                    'borderWidth' => 2,
                    'borderRadius' => 4,
                    'borderSkipped' => false,
                ]
            ]
        ];
    }

    /**
     * Generate yearly summary data for line chart
     */
    private function getYearlySummary($year)
    {
        $monthlySales = Sale::selectRaw('MONTH(created_at) as month, COUNT(*) as sales, SUM(total) as revenue')
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $monthNames = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Ags',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
        ];

        $summary = [];
        for ($month = 1; $month <= 12; $month++) {
            $data = $monthlySales->get($month);
            $summary[] = [
                'month' => $monthNames[$month],
                'sales' => $data ? (int) $data->sales : 0,
                'revenue' => $data ? (float) $data->revenue : 0,
            ];
        }

        return $summary;
    }

    /**
     * Get weekly statistics for comparison
     */
    public function getWeeklyStats()
    {
        $now = Carbon::now();
        $currentWeekStart = $now->copy()->startOfWeek();
        $currentWeekEnd = $now->copy()->endOfWeek();
        $previousWeekStart = $now->copy()->subWeek()->startOfWeek();
        $previousWeekEnd = $now->copy()->subWeek()->endOfWeek();

        $currentWeekSales = Sale::whereBetween('created_at', [$currentWeekStart, $currentWeekEnd])->count();
        $currentWeekRevenue = Sale::whereBetween('created_at', [$currentWeekStart, $currentWeekEnd])->sum('total');

        $previousWeekSales = Sale::whereBetween('created_at', [$previousWeekStart, $previousWeekEnd])->count();
        $previousWeekRevenue = Sale::whereBetween('created_at', [$previousWeekStart, $previousWeekEnd])->sum('total');

        $salesComparison = $previousWeekSales > 0 
            ? (($currentWeekSales - $previousWeekSales) / $previousWeekSales) * 100 
            : ($currentWeekSales > 0 ? 100 : 0);

        $revenueComparison = $previousWeekRevenue > 0 
            ? (($currentWeekRevenue - $previousWeekRevenue) / $previousWeekRevenue) * 100 
            : ($currentWeekRevenue > 0 ? 100 : 0);

        return response()->json([
            'current_week' => [
                'sales' => $currentWeekSales,
                'revenue' => $currentWeekRevenue,
            ],
            'previous_week' => [
                'sales' => $previousWeekSales,
                'revenue' => $previousWeekRevenue,
            ],
            'comparison' => [
                'sales' => round($salesComparison, 1),
                'revenue' => round($revenueComparison, 1),
            ]
        ]);
    }
}