<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'user_id',
        'customer_name',
        'customer_phone',
        'total',
        'payment_amount',
        'change_amount',
        'payment_method',
        'status',
        'notes'
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'payment_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public static function generateInvoiceNumber()
    {
        $lastSale = static::latest()->first();
        $lastId = $lastSale ? $lastSale->id : 0;
        
        return 'INV-' . date('Ymd') . '-' . str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);
    }

    public function updateStock()
    {
        foreach ($this->items as $item) {
            $item->product->decrement('stock', $item->quantity);
        }
    }

    /**
     * Apply filters to the sales query.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filters
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (isset($filters['search']) && $filters['search']) {
            $query->where(function ($query) use ($filters) {
                $query->where('customer_name', 'like', '%'.$filters['search'].'%')
                      ->orWhere('invoice_number', 'like', '%'.$filters['search'].'%');
            });
        }

        if (isset($filters['date']) && $filters['date']) {
            $query->whereDate('created_at', '=', $filters['date']);
        }

        if (isset($filters['status']) && $filters['status']) {
            $query->where('status', '=', $filters['status']);
        }

        return $query;
    }
}
