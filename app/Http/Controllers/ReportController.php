<?php

namespace App\Http\Controllers;

use App\Models\{Sale, Product, Category, User, ActivityLog};
use App\Services\UserActivityService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;


class ReportController extends Controller
{
    public function index()
    {
        $weeklySales = $this->getWeeklySales();
        $monthlySales = $this->getMonthlySales();
        $yearlySales = $this->getYearlySales();

        $products = Product::with('category')->get();
        $categories = Category::all();

        return Inertia::render('ProductReport', [
            'weeklySales' => $weeklySales,
            'monthlySales' => $monthlySales,
            'yearlySales' => $yearlySales,
            'products' => $products,
            'categories' => $categories,
        ]);
    }


public function userPerformance(Request $request)
{
    try {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $userId = $request->input('user_id');
        $reportType = $request->input('report_type', 'summary');

        // Set default date range if not provided
        if (!$startDate || !$endDate) {
            $startDate = Carbon::now()->startOfMonth()->format('Y-m-d');
            $endDate = Carbon::now()->endOfMonth()->format('Y-m-d');
        }

        $startDateTime = Carbon::parse($startDate)->startOfDay();
        $endDateTime = Carbon::parse($endDate)->endOfDay();

        // Jika guest, ambil semua user, jika userId ada, filter
        $users = User::with('roles')
            ->when($userId, fn($q) => $q->where('id', $userId))
            ->get();

        // Get user performance data
        $userPerformanceData = $this->getUserPerformanceData($startDateTime, $endDateTime, $userId);
        $userActivitySummary = $this->getUserActivitySummary($startDateTime, $endDateTime, $userId);
        $activityTimeline = $reportType === 'detailed'
            ? $this->getUserActivityTimeline($startDateTime, $endDateTime, $userId)
            : [];
        $userSessions = $this->getUserSessions($startDateTime, $endDateTime, $userId);

        $userPerformanceArr = $userPerformanceData ? $userPerformanceData->toArray() : [];

        return Inertia::render('Reports/UserPerformance', [
            'userPerformanceData' => $userPerformanceArr,
            'userActivitySummary' => $userActivitySummary ? $userActivitySummary->toArray() : [],
            'activityTimeline'    => is_array($activityTimeline) ? $activityTimeline : ($activityTimeline ? $activityTimeline->toArray() : []),
            'userSessions'        => $userSessions ? $userSessions->toArray() : [],
            'users'               => $users->map(fn($u) => [
                'id'   => $u->id,
                'name' => $u->name,
                'role' => $u->roles->pluck('name')->implode(', '),
            ])->toArray(),
            'filters' => [
                'start_date'  => is_object($startDate) ? $startDate->format('Y-m-d') : $startDate,
                'end_date'    => is_object($endDate) ? $endDate->format('Y-m-d') : $endDate,
                'user_id'     => $userId,
                'report_type' => $reportType,
            ],
            'summary' => [
                'total_users'             => $users->count(),
                'total_sales'             => collect($userPerformanceArr)->sum('total_sales'),
                'total_revenue'           => collect($userPerformanceArr)->sum('total_revenue'),
                'average_session_duration'=> collect($userPerformanceArr)->avg('avg_session_duration'),
            ],
        ]);
    } catch (\Exception $e) {
        \Log::error('Error in user performance report: ' . $e->getMessage());

        return Inertia::render('Reports/UserPerformance', [
            'userPerformanceData' => [],
            'userActivitySummary' => [],
            'activityTimeline'    => [],
            'userSessions'        => [],
            'users'               => [],
            'filters' => [
                'start_date'  => now()->format('Y-m-d'),
                'end_date'    => now()->format('Y-m-d'),
                'user_id'     => null,
                'report_type' => 'summary',
            ],
            'summary' => [
                'total_users'             => 0,
                'total_sales'             => 0,
                'total_revenue'           => 0,
                'average_session_duration'=> 0,
            ],
            'error' => 'Terjadi kesalahan saat memuat data laporan performa user.',
        ]);
    }
}

    private function getUserPerformanceData($startDate, $endDate, $userId = null)
    {
        $query = User::with(['roles'])
            ->when($userId, fn($q) => $q->where('id', $userId))
            ->get();

        return $query->map(function ($user) use ($startDate, $endDate) {
            // Get sales data
            $sales = Sale::where('user_id', $user->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();

            // Get activity data
            $activities = ActivityLog::where('user_id', $user->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();

            // Calculate session data
            $sessions = $this->calculateUserSessions($user->id, $startDate, $endDate);

            // Calculate performance metrics
            $totalSales = $sales->count();
            $totalRevenue = $sales->sum('total');
            $avgSaleValue = $totalSales > 0 ? $totalRevenue / $totalSales : 0;

            // Activity breakdown
            $activityBreakdown = $activities->groupBy('activity_type')->map(fn($group) => $group->count());

            return [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'role_name' => $user->roles->first()?->name ?? 'No Role',
                'total_sales' => $totalSales,
                'total_revenue' => (float) $totalRevenue,
                'avg_sale_value' => (float) $avgSaleValue,
                'total_activities' => $activities->count(),
                'activity_breakdown' => $activityBreakdown,
                'total_sessions' => $sessions['total_sessions'],
                'total_active_time' => $sessions['total_active_time'], // in minutes
                'avg_session_duration' => $sessions['avg_session_duration'], // in minutes
                'first_activity' => $activities->min('created_at'),
                'last_activity' => $activities->max('created_at'),
                'productivity_score' => $this->calculateProductivityScore($totalSales, $activities->count(), $sessions['total_active_time']),
            ];
        });
    }

    private function getUserActivitySummary($startDate, $endDate, $userId = null)
    {
        $query = ActivityLog::with('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->when($userId, fn($q) => $q->where('user_id', $userId));

        return $query->get()
            ->groupBy('user_id')
            ->map(function ($userActivities, $userId) {
                $user = $userActivities->first()->user;
                $activitiesByType = $userActivities->groupBy('activity_type');
                $activitiesByHour = $userActivities->groupBy(fn($activity) => 
                    Carbon::parse($activity->created_at)->format('H')
                );

                return [
                    'user_id' => $userId,
                    'user_name' => $user->name ?? 'Unknown',
                    'total_activities' => $userActivities->count(),
                    'activities_by_type' => $activitiesByType->map(fn($group) => $group->count()),
                    'activities_by_hour' => $activitiesByHour->map(fn($group) => $group->count()),
                    'most_active_hour' => $activitiesByHour->sortByDesc(fn($group) => $group->count())->keys()->first(),
                    'peak_activity_day' => $userActivities->groupBy(fn($activity) => 
                        Carbon::parse($activity->created_at)->format('Y-m-d')
                    )->sortByDesc(fn($group) => $group->count())->keys()->first(),
                ];
            });
    }

    private function getUserActivityTimeline($startDate, $endDate, $userId = null)
    {
        return ActivityLog::with('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->orderBy('created_at', 'desc')
            ->limit(1000) // Limit for performance
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'user_id' => $activity->user_id,
                    'user_name' => $activity->user->name ?? 'Unknown',
                    'activity_type' => $activity->activity_type,
                    'description' => $activity->description,
                    'ip_address' => $activity->ip_address,
                    'created_at' => $activity->created_at->toDateTimeString(),
                    'date' => $activity->created_at->format('Y-m-d'),
                    'time' => $activity->created_at->format('H:i:s'),
                ];
            });
    }

    private function getUserSessions($startDate, $endDate, $userId = null)
    {
        $users = $userId ? [$userId] : User::pluck('id')->toArray();
        
        return collect($users)->map(function ($uId) use ($startDate, $endDate) {
            $sessions = $this->calculateUserSessions($uId, $startDate, $endDate);
            $user = User::find($uId);
            
            return [
                'user_id' => $uId,
                'user_name' => $user->name ?? 'Unknown',
                'total_sessions' => $sessions['total_sessions'],
                'total_active_time' => $sessions['total_active_time'],
                'avg_session_duration' => $sessions['avg_session_duration'],
                'session_details' => $sessions['sessions'],
            ];
        });
    }

    private function calculateUserSessions($userId, $startDate, $endDate)
    {
        $activities = ActivityLog::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at')
            ->get();

        if ($activities->isEmpty()) {
            return [
                'total_sessions' => 0,
                'total_active_time' => 0,
                'avg_session_duration' => 0,
                'sessions' => [],
            ];
        }

        $sessions = [];
        $currentSession = null;
        $sessionTimeout = 30; // 30 minutes timeout

        foreach ($activities as $activity) {
            $activityTime = Carbon::parse($activity->created_at);

            if ($activity->activity_type === 'login' || !$currentSession) {
                // Start new session
                $currentSession = [
                    'start_time' => $activityTime,
                    'end_time' => $activityTime,
                    'activities' => 1,
                    'activity_types' => [$activity->activity_type],
                ];
            } else {
                // Check if activity is within session timeout
                $timeDiff = $currentSession['end_time']->diffInMinutes($activityTime);
                
                if ($timeDiff <= $sessionTimeout) {
                    // Continue current session
                    $currentSession['end_time'] = $activityTime;
                    $currentSession['activities']++;
                    $currentSession['activity_types'][] = $activity->activity_type;
                } else {
                    // Session ended, save it and start new one
                    $sessions[] = [
                        'start_time' => $currentSession['start_time']->toDateTimeString(),
                        'end_time' => $currentSession['end_time']->toDateTimeString(),
                        'duration' => $currentSession['start_time']->diffInMinutes($currentSession['end_time']),
                        'activities' => $currentSession['activities'],
                        'activity_types' => array_unique($currentSession['activity_types']),
                    ];

                    $currentSession = [
                        'start_time' => $activityTime,
                        'end_time' => $activityTime,
                        'activities' => 1,
                        'activity_types' => [$activity->activity_type],
                    ];
                }
            }

            // Handle logout
            if ($activity->activity_type === 'logout' && $currentSession) {
                $sessions[] = [
                    'start_time' => $currentSession['start_time']->toDateTimeString(),
                    'end_time' => $activityTime->toDateTimeString(),
                    'duration' => $currentSession['start_time']->diffInMinutes($activityTime),
                    'activities' => $currentSession['activities'],
                    'activity_types' => array_unique($currentSession['activity_types']),
                ];
                $currentSession = null;
            }
        }

        // Handle ongoing session
        if ($currentSession) {
            $sessions[] = [
                'start_time' => $currentSession['start_time']->toDateTimeString(),
                'end_time' => $currentSession['end_time']->toDateTimeString(),
                'duration' => $currentSession['start_time']->diffInMinutes($currentSession['end_time']),
                'activities' => $currentSession['activities'],
                'activity_types' => array_unique($currentSession['activity_types']),
            ];
        }

        $totalSessions = count($sessions);
        $totalActiveTime = collect($sessions)->sum('duration');
        $avgSessionDuration = $totalSessions > 0 ? $totalActiveTime / $totalSessions : 0;

        return [
            'total_sessions' => $totalSessions,
            'total_active_time' => $totalActiveTime,
            'avg_session_duration' => round($avgSessionDuration, 2),
            'sessions' => $sessions,
        ];
    }

    private function calculateProductivityScore($totalSales, $totalActivities, $totalActiveTime)
    {
        if ($totalActiveTime == 0) return 0;

        // Calculate scores (0-100)
        $salesPerHour = $totalActiveTime > 0 ? ($totalSales / ($totalActiveTime / 60)) : 0;
        $activitiesPerHour = $totalActiveTime > 0 ? ($totalActivities / ($totalActiveTime / 60)) : 0;

        // Weighted score calculation
        $salesScore = min(100, $salesPerHour * 10); // 10 sales per hour = 100 points
        $activityScore = min(100, $activitiesPerHour * 2); // 50 activities per hour = 100 points

        // Combined score (70% sales, 30% activities)
        $productivityScore = ($salesScore * 0.7) + ($activityScore * 0.3);

        return round($productivityScore, 2);
    }

    // Add route method to web.php routes
    public function getUserActivityChart(Request $request)
    {
        $startDate = Carbon::parse($request->input('start_date', Carbon::now()->startOfMonth()));
        $endDate = Carbon::parse($request->input('end_date', Carbon::now()->endOfMonth()));
        $userId = $request->input('user_id');

        $query = ActivityLog::whereBetween('created_at', [$startDate, $endDate])
            ->when($userId, fn($q) => $q->where('user_id', $userId));

        // Daily activity chart
        $dailyActivity = $query->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Hourly activity chart
        $hourlyActivity = $query->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Activity type distribution
        $activityTypes = $query->selectRaw('activity_type, COUNT(*) as count')
            ->groupBy('activity_type')
            ->get();

        return response()->json([
            'daily_activity' => $dailyActivity,
            'hourly_activity' => $hourlyActivity,
            'activity_types' => $activityTypes,
        ]);
    }

    public function weekly(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        // Default ke minggu ini jika tidak ada parameter
        $startDate = $request->input('start_date') 
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->startOfWeek();
            
        $endDate = $request->input('end_date') 
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfWeek();

        // Debugging: Log the date range being used
        \Log::info("Fetching sales data from {$startDate} to {$endDate}");

        $sales = Sale::with(['items.product'])
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate])
                      ->orWhereBetween('payment_date', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          // Untuk menangkap data yang payment_date-nya null
                          $q->whereNull('payment_date')
                            ->whereBetween('created_at', [$startDate, $endDate]);
                      });
            })
            ->orderByDesc('payment_date')
            ->orderByDesc('created_at')
            ->get();

        // Debugging: Log jumlah data yang ditemukan
        \Log::info("Found {$sales->count()} sales records");

        return Inertia::render('Reports/Weekly', [
            'weeklySales' => $sales->map(function ($sale) {
                $saleDate = $sale->payment_date ?? $sale->created_at;
                
                return [
                    'date' => $saleDate->format('Y-m-d'),
                    'invoice_number' => $sale->invoice_number,
                    'total' => (float) $sale->total,
                    'items' => $sale->items->map(function ($item) {
                        return [
                            'product_id' => $item->product_id,
                            'product_name' => $item->product->name ?? '-',
                            'quantity' => (int) $item->quantity,
                            'price' => (float) $item->price,
                            'subtotal' => (float) $item->subtotal,
                        ];
                    }),
                ];
            }),
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    public function monthly(Request $request)
    {
        $month = (int)($request->input('month') ?? now()->month);
        $year = (int)($request->input('year') ?? now()->year);
        
        // Validasi input
        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }
        
        if ($year < 2020 || $year > now()->year + 1) {
            $year = now()->year;
        }

        // PERBAIKAN UTAMA: Panggil method dengan parameter yang benar
        $monthlySales = $this->getMonthlySales($month, $year);

        return Inertia::render('Reports/Monthly', [
            'monthlySales' => $monthlySales,
            'month' => $month, // Tambahkan ini
            'year' => $year,   // Tambahkan ini
            'filters' => [
                'month' => $month,
                'year' => $year,
            ],
            'availablePeriods' => $this->getAvailableMonthsAndYears(),
            'monthName' => Carbon::createFromDate($year, $month, 1)->translatedFormat('F Y'),
        ]);
    }

    public function yearly(Request $request)
    {
        $year = (int) $request->input('year', now()->year);

        // Ambil semua tahun unik dari data penjualan
        $availableYears = Sale::selectRaw('YEAR(payment_date) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        return Inertia::render('Reports/Yearly', [
            'year' => $year,
            'yearlySales' => $this->getYearlySales($year),
            'availableYears' => $availableYears,
        ]);
    }

    public function product(Request $request)
    {
        try {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $categoryId = $request->input('category_id');

            $products = Product::with('category')
                ->when($categoryId, fn($q) => $q->where('category_id', $categoryId))
                ->get();

            $salesQuery = Sale::with(['items.product']);
            if ($startDate && $endDate) {
                $salesQuery->whereBetween('created_at', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay()
                ]);
            }
            $sales = $salesQuery->get();

            $salesItems = $sales->flatMap(fn($sale) => $sale->items)->groupBy('product_id');

            $productSales = $products->map(function ($product) use ($salesItems) {
                $items = $salesItems->get($product->id, collect());
                return [
                    'product_id' => $product->id,
                    'product_code' => $product->code,
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
                })->values();

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

    private function getSalesData(Carbon $startDate, Carbon $endDate)
    {
        return Sale::with(['items.product'])
            ->where(function($query) use ($startDate, $endDate) {
                // Include sales where either created_at or payment_date falls within the range
                $query->whereBetween('created_at', [$startDate, $endDate])
                      ->orWhereBetween('payment_date', [$startDate, $endDate]);
            })
            ->orderBy('payment_date', 'desc') // Primary sort by payment date
            ->orderBy('created_at', 'desc')   // Secondary sort by creation date
            ->get()
            ->map(function ($sale) {
                // Use payment date if available, otherwise use created_at
                $saleDate = $sale->payment_date ?? $sale->created_at;
                
                return [
                    'date' => $saleDate->format('Y-m-d'),
                    'invoice_number' => $sale->invoice_number,
                    'customer_name' => $sale->customer_name,
                    'total' => (float) $sale->total,
                    'payment_method' => $sale->payment_method,
                    'payment_status' => $sale->payment_status,
                    'payment_date' => $sale->payment_date?->format('Y-m-d H:i:s'),
                    'created_at' => $sale->created_at->format('Y-m-d H:i:s'),
                    'items' => $sale->items->map(function ($item) {
                        return [
                            'product_id' => $item->product_id,
                            'product_name' => $item->product->name ?? '-',
                            'quantity' => (int) $item->quantity,
                            'price' => (float) $item->price,
                            'subtotal' => (float) $item->subtotal,
                        ];
                    }),
                ];
            });
    }
    
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

    // PERBAIKAN UTAMA: Method getMonthlySales yang diperbaiki
    private function getMonthlySales($month = null, $year = null)
    {
        try {
            // Set default values jika parameter kosong
            $month = $month ?? now()->month;
            $year = $year ?? now()->year;

            // PERBAIKAN: Query yang lebih fleksibel untuk menangkap data dengan benar
            $sales = Sale::with(['items.product'])
                ->where(function($query) use ($month, $year) {
                    // Cek berdasarkan payment_date terlebih dahulu
                    $query->where(function($q) use ($month, $year) {
                        $q->whereNotNull('payment_date')
                          ->whereMonth('payment_date', $month)
                          ->whereYear('payment_date', $year);
                    })
                    // Jika payment_date null, gunakan created_at
                    ->orWhere(function($q) use ($month, $year) {
                        $q->whereNull('payment_date')
                          ->whereMonth('created_at', $month)
                          ->whereYear('created_at', $year);
                    });
                })
                // PERBAIKAN: Hapus filter status 'completed' karena bisa jadi nama status berbeda
                // ->where('status', 'completed') 
                ->orderBy('payment_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            \Log::info("Monthly sales query for {$month}/{$year}: Found {$sales->count()} records");

            return $sales->map(function($sale) {
                return [
                    'id' => $sale->id,
                    'date' => ($sale->payment_date ?? $sale->created_at)->format('Y-m-d'),
                    'invoice_number' => $sale->invoice_number,
                    'customer' => $sale->customer_name ?? 'Walk-in Customer',
                    'total' => (float) $sale->total,
                    'payment_method' => $sale->payment_method ?? 'cash',
                    'items' => $sale->items->map(function($item) {
                        return [
                            'product_id' => $item->product_id,
                            'product_name' => $item->product->name ?? 'Produk Tidak Ditemukan',
                            'quantity' => (int) $item->quantity,
                            'price' => (float) $item->price,
                            'subtotal' => (float) $item->subtotal,
                        ];
                    })->toArray(),
                ];
            })->toArray();
            
        } catch (\Exception $e) {
            \Log::error('Error fetching monthly sales: ' . $e->getMessage());
            return [];
        }
    }

    private function getAvailableMonthsAndYears()
    {
        try {
            // PERBAIKAN: Query yang lebih fleksibel untuk mengambil periode yang tersedia
            $periods = Sale::selectRaw('
                    COALESCE(MONTH(payment_date), MONTH(created_at)) as month, 
                    COALESCE(YEAR(payment_date), YEAR(created_at)) as year
                ')
                ->groupByRaw('COALESCE(YEAR(payment_date), YEAR(created_at)), COALESCE(MONTH(payment_date), MONTH(created_at))')
                ->orderByRaw('COALESCE(YEAR(payment_date), YEAR(created_at)) DESC, COALESCE(MONTH(payment_date), MONTH(created_at)) DESC')
                ->get();

            return $periods->map(function($row) {
                $carbon = Carbon::createFromDate($row->year, $row->month, 1);
                return [
                    'month' => (int) $row->month,
                    'year' => (int) $row->year,
                    'label' => $carbon->translatedFormat('F Y'),
                    'value' => $row->year . '-' . str_pad($row->month, 2, '0', STR_PAD_LEFT),
                ];
            })->toArray();
            
        } catch (\Exception $e) {
            \Log::error('Error fetching available periods: ' . $e->getMessage());
            return [];
        }
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