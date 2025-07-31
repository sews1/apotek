<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ActivityLogger
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log for authenticated users
        if (Auth::check() && $this->shouldLog($request)) {
            $this->logActivity($request);
        }

        return $response;
    }

    /**
     * Determine if the request should be logged
     */
    private function shouldLog(Request $request): bool
    {
        $method = $request->method();
        $uri = $request->getRequestUri();

        // Don't log certain routes
        $excludePatterns = [
            '/api/csrf-cookie',
            '/sanctum/csrf-cookie',
            '/_ignition',
            '/telescope',
            '/horizon',
            '/nova',
            '/debugbar',
            '/favicon.ico',
            '/robots.txt',
            '.css',
            '.js',
            '.png',
            '.jpg',
            '.jpeg',
            '.gif',
            '.svg',
            '.ico',
            '.woff',
            '.woff2',
            '.ttf',
            '.eot'
        ];

        foreach ($excludePatterns as $pattern) {
            if (str_contains($uri, $pattern)) {
                return false;
            }
        }

        // Don't log too frequent GET requests to the same page
        if ($method === 'GET' && $this->isRecentDuplicate($request)) {
            return false;
        }

        return true;
    }

    /**
     * Check if this is a recent duplicate request
     */
    private function isRecentDuplicate(Request $request): bool
    {
        $cacheKey = 'activity_log_' . Auth::id() . '_' . md5($request->getRequestUri());
        
        if (cache()->has($cacheKey)) {
            return true;
        }

        // Cache for 30 seconds to prevent duplicate logs
        cache()->put($cacheKey, true, 30);
        return false;
    }

    /**
     * Log the activity
     */
    private function logActivity(Request $request): void
    {
        try {
            $activityType = $this->determineActivityType($request);
            $description = $this->generateDescription($request, $activityType);
            $data = $this->extractRelevantData($request);

            ActivityLog::create([
                'user_id' => Auth::id(),
                'activity_type' => $activityType,
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'data' => $data,
                'session_id' => session()->getId(),
            ]);
        } catch (\Exception $e) {
            // Log error but don't break the application
            \Log::error('Failed to log activity: ' . $e->getMessage());
        }
    }

    /**
     * Determine activity type based on request
     */
    private function determineActivityType(Request $request): string
    {
        $method = $request->method();
        $uri = $request->getRequestUri();
        $routeName = $request->route()?->getName() ?? '';

        // Login/Logout
        if (str_contains($uri, '/login') && $method === 'POST') {
            return 'login';
        }
        if (str_contains($uri, '/logout')) {
            return 'logout';
        }

        // Sales
        if (str_contains($uri, '/sales') || str_contains($routeName, 'sales')) {
            if ($method === 'POST') return 'sale_create';
            if ($method === 'PUT' || $method === 'PATCH') return 'sale_update';
            if ($method === 'DELETE') return 'sale_delete';
            return 'sale_view';
        }

        // Products
        if (str_contains($uri, '/products') || str_contains($routeName, 'products')) {
            if ($method === 'POST') return 'product_create';
            if ($method === 'PUT' || $method === 'PATCH') return 'product_update';
            if ($method === 'DELETE') return 'product_delete';
            return 'product_view';
        }

        // Categories
        if (str_contains($uri, '/categories') || str_contains($routeName, 'categories')) {
            if ($method === 'POST') return 'category_create';
            if ($method === 'PUT' || $method === 'PATCH') return 'category_update';
            if ($method === 'DELETE') return 'category_delete';
            return 'category_view';
        }

        // Reports
        if (str_contains($uri, '/reports') || str_contains($routeName, 'reports')) {
            if (str_contains($uri, 'export') || str_contains($uri, 'download')) {
                return 'export';
            }
            return 'report_view';
        }

        // Users/Staff
        if (str_contains($uri, '/users') || str_contains($routeName, 'users')) {
            if ($method === 'POST') return 'user_create';
            if ($method === 'PUT' || $method === 'PATCH') return 'user_update';
            if ($method === 'DELETE') return 'user_delete';
            return 'user_view';
        }

        // Dashboard
        if (str_contains($uri, '/dashboard') || $uri === '/') {
            return 'dashboard_view';
        }

        // Generic activity types
        if ($method === 'POST') return 'create';
        if ($method === 'PUT' || $method === 'PATCH') return 'update';
        if ($method === 'DELETE') return 'delete';
        
        return 'view';
    }

    /**
     * Generate human-readable description
     */
    private function generateDescription(Request $request, string $activityType): string
    {
        $uri = $request->getRequestUri();
        $routeName = $request->route()?->getName() ?? '';

        // Custom descriptions for specific activities
        $descriptions = [
            'login' => 'User logged in',
            'logout' => 'User logged out',
            'dashboard_view' => 'Viewed dashboard',
            'sale_create' => 'Created new sale',
            'sale_update' => 'Updated sale',
            'sale_delete' => 'Deleted sale',
            'sale_view' => 'Viewed sales page',
            'product_create' => 'Created new product',
            'product_update' => 'Updated product',
            'product_delete' => 'Deleted product',
            'product_view' => 'Viewed products page',
            'category_create' => 'Created new category',
            'category_update' => 'Updated category',
            'category_delete' => 'Deleted category',
            'category_view' => 'Viewed categories page',
            'report_view' => 'Viewed report',
            'export' => 'Exported data',
            'user_create' => 'Created new user',
            'user_update' => 'Updated user',
            'user_delete' => 'Deleted user',
            'user_view' => 'Viewed users page',
        ];

        if (isset($descriptions[$activityType])) {
            return $descriptions[$activityType];
        }

        // Fallback description
        return "Performed {$activityType} action on " . parse_url($uri, PHP_URL_PATH);
    }

    /**
     * Extract relevant data from request
     */
    private function extractRelevantData(Request $request): ?array
    {
        $data = [];
        
        // Add route information
        if ($route = $request->route()) {
            $data['route_name'] = $route->getName();
            $data['route_parameters'] = $route->parameters();
        }

        // Add query parameters (limited)
        $queryParams = $request->query();
        if (!empty($queryParams)) {
            // Only include safe query parameters
            $safeParams = array_intersect_key($queryParams, array_flip([
                'page', 'per_page', 'sort', 'order', 'filter', 'search', 'category', 'status'
            ]));
            if (!empty($safeParams)) {
                $data['query_params'] = $safeParams;
            }
        }

        // Add request method and size
        $data['method'] = $request->method();
        $data['request_size'] = strlen($request->getContent());

        return !empty($data) ? $data : null;
    }
}

// Register middleware in app/Http/Kernel.php:
/*
protected $middlewareGroups = [
    'web' => [
        // ... other middleware
        \App\Http\Middleware\ActivityLogger::class,
    ],
];

// Or register as route middleware:
protected $routeMiddleware = [
    // ... other middleware
    'activity.log' => \App\Http\Middleware\ActivityLogger::class,
];
*/