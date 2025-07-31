<?php

namespace App\Services;

use App\Models\{User, ActivityLog, Sale};
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class UserActivityService
{
    /**
     * Get comprehensive user performance data
     */
    public function getUserPerformanceData(Carbon $startDate, Carbon $endDate, ?int $userId = null): Collection
    {
        $query = User::with(['roles']);
        
        if ($userId) {
            $query->where('id', $userId);
        }

        return $query->get()->map(function ($user) use ($startDate, $endDate) {
            return $this->calculateUserMetrics($user, $startDate, $endDate);
        });
    }

    /**
     * Calculate comprehensive metrics for a single user
     */
    public function calculateUserMetrics(User $user, Carbon $startDate, Carbon $endDate): array
    {
        // Get user's activities in date range
        $activities = ActivityLog::where('user_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at')
            ->get();

        // Get user's sales in date range
        $sales = Sale::where('user_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        // Calculate basic metrics
        $totalSales = $sales->count();
        $totalRevenue = $sales->sum('total');
        $avgSaleValue = $totalSales > 0 ? $totalRevenue / $totalSales : 0;

        // Activity analysis
        $activityBreakdown = $activities->groupBy('activity_type')->map->count();
        $totalActivities = $activities->count();

        // Session analysis
        $sessions = $this->calculateSessions($activities);
        
        // Time analysis
        $timeMetrics = $this->calculateTimeMetrics($activities, $sessions);

        // Performance scoring
        $productivityScore = $this->calculateProductivityScore([
            'sales_count' => $totalSales,
            'revenue' => $totalRevenue,
            'activities_count' => $totalActivities,
            'active_time' => $timeMetrics['total_active_time'],
            'sessions_count' => $sessions['total_sessions'],
        ]);

        // Peak activity analysis
        $peakMetrics = $this->calculatePeakMetrics($activities);

        return [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'role_name' => $user->roles->first()?->name ?? 'No Role',
            
            // Sales metrics
            'total_sales' => $totalSales,
            'total_revenue' => (float) $totalRevenue,
            'avg_sale_value' => (float) $avgSaleValue,
            'sales_per_hour' => $timeMetrics['total_active_hours'] > 0 ? 
                round($totalSales / $timeMetrics['total_active_hours'], 2) : 0,
            'revenue_per_hour' => $timeMetrics['total_active_hours'] > 0 ? 
                round($totalRevenue / $timeMetrics['total_active_hours'], 2) : 0,

            // Activity metrics
            'total_activities' => $totalActivities,
            'activity_breakdown' => $activityBreakdown,
            'activities_per_hour' => $timeMetrics['total_active_hours'] > 0 ? 
                round($totalActivities / $timeMetrics['total_active_hours'], 2) : 0,

            // Session metrics
            'total_sessions' => $sessions['total_sessions'],
            'total_active_time' => $timeMetrics['total_active_time'], // in minutes
            'total_active_hours' => $timeMetrics['total_active_hours'],
            'avg_session_duration' => $sessions['avg_session_duration'], // in minutes
            'longest_session' => $sessions['longest_session'],
            'shortest_session' => $sessions['shortest_session'],

            // Performance metrics
            'productivity_score' => $productivityScore,
            'efficiency_rating' => $this->getEfficiencyRating($productivityScore),
            
            // Peak activity metrics
            'most_active_hour' => $peakMetrics['most_active_hour'],
            'most_active_day' => $peakMetrics['most_active_day'],
            'peak_activity_count' => $peakMetrics['peak_activity_count'],

            // Timeline
            'first_activity' => $activities->min('created_at'),
            'last_activity' => $activities->max('created_at'),
            'days_active' => $activities->groupBy(fn($a) => $a->created_at->format('Y-m-d'))->count(),

            // Session details for modal
            'session_details' => $sessions['sessions'] ?? [],
        ];
    }

    /**
     * Calculate user sessions from activities
     */
    public function calculateSessions(Collection $activities): array
    {
        if ($activities->isEmpty()) {
            return [
                'total_sessions' => 0,
                'avg_session_duration' => 0,
                'longest_session' => 0,
                'shortest_session' => 0,
                'sessions' => [],
            ];
        }

        $sessions = [];
        $currentSession = null;
        $sessionTimeout = 30; // 30 minutes timeout

        foreach ($activities as $activity) {
            $activityTime = $activity->created_at;

            // Start new session conditions
            if ($activity->activity_type === 'login' || 
                $activity->activity_type === 'dashboard_view' || 
                !$currentSession) {
                
                if ($currentSession) {
                    $sessions[] = $this->finalizeSession($currentSession);
                }

                $currentSession = [
                    'start_time' => $activityTime,
                    'end_time' => $activityTime,
                    'activities' => 1,
                    'activity_types' => [$activity->activity_type],
                    'sales_made' => $activity->activity_type === 'sale_create' ? 1 : 0,
                ];
                continue;
            }

            // Check session timeout
            $timeDiff = $currentSession['end_time']->diffInMinutes($activityTime);
            
            if ($timeDiff <= $sessionTimeout) {
                // Continue current session
                $currentSession['end_time'] = $activityTime;
                $currentSession['activities']++;
                $currentSession['activity_types'][] = $activity->activity_type;
                
                if ($activity->activity_type === 'sale_create') {
                    $currentSession['sales_made']++;
                }
            } else {
                // Session timeout - finalize current and start new
                $sessions[] = $this->finalizeSession($currentSession);
                
                $currentSession = [
                    'start_time' => $activityTime,
                    'end_time' => $activityTime,
                    'activities' => 1,
                    'activity_types' => [$activity->activity_type],
                    'sales_made' => $activity->activity_type === 'sale_create' ? 1 : 0,
                ];
            }

            // Handle explicit logout
            if ($activity->activity_type === 'logout') {
                $currentSession['end_time'] = $activityTime;
                $sessions[] = $this->finalizeSession($currentSession);
                $currentSession = null;
            }
        }

        // Finalize last session
        if ($currentSession) {
            $sessions[] = $this->finalizeSession($currentSession);
        }

        $durations = array_column($sessions, 'duration');
        
        return [
            'total_sessions' => count($sessions),
            'avg_session_duration' => count($durations) > 0 ? round(array_sum($durations) / count($durations), 2) : 0,
            'longest_session' => count($durations) > 0 ? max($durations) : 0,
            'shortest_session' => count($durations) > 0 ? min($durations) : 0,
            'sessions' => $sessions,
        ];
    }

    /**
     * Finalize session data
     */
    private function finalizeSession(array $session): array
    {
        $duration = $session['start_time']->diffInMinutes($session['end_time']);
        
        return [
            'start_time' => $session['start_time']->toDateTimeString(),
            'end_time' => $session['end_time']->toDateTimeString(),
            'duration' => $duration,
            'activities' => $session['activities'],
            'activity_types' => array_unique($session['activity_types']),
            'sales_made' => $session['sales_made'] ?? 0,
            'productivity_score' => $this->calculateSessionProductivity($session, $duration),
        ];
    }

    /**
     * Calculate time-based metrics
     */
    public function calculateTimeMetrics(Collection $activities, array $sessions): array
    {
        $totalActiveTime = array_sum(array_column($sessions['sessions'] ?? [], 'duration'));
        $totalActiveHours = $totalActiveTime / 60;

        return [
            'total_active_time' => $totalActiveTime, // minutes
            'total_active_hours' => round($totalActiveHours, 2),
            'avg_daily_time' => $activities->isNotEmpty() ? 
                round($totalActiveTime / $activities->groupBy(fn($a) => $a->created_at->format('Y-m-d'))->count(), 2) : 0,
        ];
    }

    /**
     * Calculate peak activity metrics
     */
    public function calculatePeakMetrics(Collection $activities): array
    {
        if ($activities->isEmpty()) {
            return [
                'most_active_hour' => null,
                'most_active_day' => null,
                'peak_activity_count' => 0,
            ];
        }

        // Hour analysis
        $hourlyActivity = $activities->groupBy(fn($activity) => $activity->created_at->format('H'));
        $mostActiveHour = $hourlyActivity->sortByDesc->count()->keys()->first();

        // Daily analysis
        $dailyActivity = $activities->groupBy(fn($activity) => $activity->created_at->format('Y-m-d'));
        $mostActiveDay = $dailyActivity->sortByDesc->count()->keys()->first();

        return [
            'most_active_hour' => $mostActiveHour ? (int)$mostActiveHour : null,
            'most_active_day' => $mostActiveDay,
            'peak_activity_count' => $dailyActivity->max(fn($day) => $day->count()),
            'hourly_distribution' => $hourlyActivity->map->count(),
            'daily_distribution' => $dailyActivity->map->count(),
        ];
    }

    /**
     * Calculate productivity score (0-100)
     */
    public function calculateProductivityScore(array $metrics): float
    {
        if ($metrics['active_time'] == 0) return 0;

        $activeHours = $metrics['active_time'] / 60;
        
        // Sales productivity (0-40 points)
        $salesPerHour = $activeHours > 0 ? $metrics['sales_count'] / $activeHours : 0;
        $salesScore = min(40, $salesPerHour * 8); // 5 sales/hour = 40 points

        // Revenue productivity (0-30 points)
        $revenuePerHour = $activeHours > 0 ? $metrics['revenue'] / $activeHours : 0;
        $revenueScore = min(30, $revenuePerHour / 100000 * 30); // 100k/hour = 30 points

        // Activity level (0-20 points)
        $activitiesPerHour = $activeHours > 0 ? $metrics['activities_count'] / $activeHours : 0;
        $activityScore = min(20, $activitiesPerHour / 30 * 20); // 30 activities/hour = 20 points

        // Session efficiency (0-10 points)
        $avgSessionHours = $metrics['sessions_count'] > 0 ? $activeHours / $metrics['sessions_count'] : 0;
        $sessionScore = $avgSessionHours > 0 ? min(10, (2 / $avgSessionHours) * 10) : 0; // 2 hours avg = 10 points

        $totalScore = $salesScore + $revenueScore + $activityScore + $sessionScore;
        
        return round($totalScore, 2);
    }

    /**
     * Calculate session-specific productivity
     */
    private function calculateSessionProductivity(array $session, float $duration): float
    {
        if ($duration == 0) return 0;

        $hourlyActivities = ($session['activities'] / $duration) * 60;
        $salesBonus = ($session['sales_made'] ?? 0) * 10;
        
        return min(100, $hourlyActivities + $salesBonus);
    }

    /**
     * Get efficiency rating based on productivity score
     */
    public function getEfficiencyRating(float $productivityScore): string
    {
        if ($productivityScore >= 80) return 'Excellent';
        if ($productivityScore >= 65) return 'Good';
        if ($productivityScore >= 50) return 'Average';
        if ($productivityScore >= 35) return 'Below Average';
        return 'Poor';
    }

    /**
     * Get activity summary for dashboard
     */
    public function getActivitySummary(?int $userId = null, int $days = 7): array
    {
        $startDate = Carbon::now()->subDays($days)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        $query = ActivityLog::whereBetween('created_at', [$startDate, $endDate]);
        
        if ($userId) {
            $query->where('user_id', $userId);
        }

        $activities = $query->with('user')->get();

        return [
            'total_activities' => $activities->count(),
            'unique_users' => $activities->unique('user_id')->count(),
            'activity_types' => $activities->groupBy('activity_type')->map->count(),
            'daily_breakdown' => $activities->groupBy(fn($a) => $a->created_at->format('Y-m-d'))->map->count(),
            'top_users' => $activities->groupBy('user_id')
                ->map(fn($userActivities) => [
                    'user_name' => $userActivities->first()->user->name ?? 'Unknown',
                    'activity_count' => $userActivities->count(),
                ])
                ->sortByDesc('activity_count')
                ->take(5),
        ];
    }

    /**
     * Get real-time activity feed
     */
    public function getRealtimeActivityFeed(int $limit = 20): Collection
    {
        return ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'user_name' => $activity->user->name ?? 'Unknown',
                    'activity_type' => $activity->activity_type,
                    'description' => $activity->description,
                    'time_ago' => $activity->created_at->diffForHumans(),
                    'created_at' => $activity->created_at->toDateTimeString(),
                ];
            });
    }
}