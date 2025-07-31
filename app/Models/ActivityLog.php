<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'activity_type',
        'description',
        'ip_address',
        'user_agent',
        'data', // JSON field for additional data
        'session_id', // To track user sessions
    ];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('activity_type', $type);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', Carbon::today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('created_at', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [
            Carbon::parse($startDate)->startOfDay(),
            Carbon::parse($endDate)->endOfDay()
        ]);
    }

    // Static methods for logging activities
    public static function logActivity($userId, $activityType, $description, $data = null)
    {
        return self::create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'data' => $data,
            'session_id' => session()->getId(),
        ]);
    }

    public static function logLogin($userId)
    {
        return self::logActivity($userId, 'login', 'User logged in');
    }

    public static function logLogout($userId)
    {
        return self::logActivity($userId, 'logout', 'User logged out');
    }

    public static function logSale($userId, $saleId, $total)
    {
        return self::logActivity($userId, 'sale', "Created sale #{$saleId}", [
            'sale_id' => $saleId,
            'total' => $total
        ]);
    }

    public static function logProductCreate($userId, $productId, $productName)
    {
        return self::logActivity($userId, 'product_create', "Created product: {$productName}", [
            'product_id' => $productId,
            'product_name' => $productName
        ]);
    }

    public static function logProductUpdate($userId, $productId, $productName)
    {
        return self::logActivity($userId, 'product_update', "Updated product: {$productName}", [
            'product_id' => $productId,
            'product_name' => $productName
        ]);
    }

    public static function logProductDelete($userId, $productId, $productName)
    {
        return self::logActivity($userId, 'product_delete', "Deleted product: {$productName}", [
            'product_id' => $productId,
            'product_name' => $productName
        ]);
    }

    public static function logView($userId, $page)
    {
        return self::logActivity($userId, 'view', "Viewed {$page} page", [
            'page' => $page
        ]);
    }

    public static function logExport($userId, $type)
    {
        return self::logActivity($userId, 'export', "Exported {$type} report", [
            'export_type' => $type
        ]);
    }

    // Accessor for formatted date
    public function getFormattedDateAttribute()
    {
        return $this->created_at->format('d/m/Y H:i:s');
    }

    // Accessor for activity type badge color
    public function getActivityTypeBadgeAttribute()
    {
        $colors = [
            'login' => 'bg-green-100 text-green-800',
            'logout' => 'bg-red-100 text-red-800',
            'sale' => 'bg-blue-100 text-blue-800',
            'product_create' => 'bg-purple-100 text-purple-800',
            'product_update' => 'bg-yellow-100 text-yellow-800',
            'product_delete' => 'bg-red-100 text-red-800',
            'view' => 'bg-gray-100 text-gray-800',
            'export' => 'bg-indigo-100 text-indigo-800',
        ];

        return $colors[$this->activity_type] ?? 'bg-gray-100 text-gray-800';
    }
}