<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

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
        'payment_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'payment_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'payment_date' => 'datetime', // ✅ Ini memastikan bisa format() langsung
    ];

    // Relasi ke user (kasir/admin)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke item penjualan
    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    // 🔢 Fungsi untuk membuat invoice otomatis
    public static function generateInvoiceNumber(): string
    {
        $prefix = 'INV-' . date('Ymd');

        $lastSaleToday = static::whereDate('created_at', now()->toDateString())
            ->where('invoice_number', 'like', "$prefix-%")
            ->orderByDesc('invoice_number')
            ->first();

        $newNumber = $lastSaleToday
            ? ((int) substr($lastSaleToday->invoice_number, -4)) + 1
            : 1;

        return $prefix . '-' . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    // 🔁 Update stok produk saat transaksi tersimpan
    public function updateStock()
    {
        foreach ($this->items as $item) {
            $item->product->decrement('stock', $item->quantity);
        }
    }

    // 🔍 Filter untuk pencarian laporan
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('customer_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('invoice_number', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['date'])) {
            $query->whereDate('payment_date', $filters['date']); // 🔁 Ganti ke payment_date
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query;
    }
}
