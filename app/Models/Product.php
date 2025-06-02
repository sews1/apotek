<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'category_id',
        'description',
        'purchase_price',
        'selling_price',
        'stock',
        'min_stock',
        'unit',
        'barcode',
        'image',
        'entry_date',
        'expired_date',
        'is_active',
        // 'supplier_id', // Pastikan kolom ini ada di database jika ingin relasi ke supplier
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'entry_date' => 'date',
        'expired_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Relasi ke kategori produk
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relasi ke supplier produk (jika ada)
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Accessor untuk status stok: in_stock, low_stock, out_of_stock
     */
    public function getStockStatusAttribute()
    {
        if ($this->stock <= 0) {
            return 'out_of_stock';
        } elseif ($this->stock < $this->min_stock) {
            return 'low_stock';
        }
        return 'in_stock';
    }

    /**
     * Scope untuk produk dengan stok rendah
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock', '<', 'min_stock');
    }

    /**
     * Scope untuk filter berdasarkan search, kategori, dan status stok
     */
    public function scopeFilter($query, array $filters)
    {
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('code', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['category'])) {
            $query->where('category_id', $filters['category']);
        }

        if (!empty($filters['stock_status'])) {
            if ($filters['stock_status'] === 'empty') {
                $query->where('stock', '<=', 0);
            } elseif ($filters['stock_status'] === 'low') {
                $query->whereColumn('stock', '<', 'min_stock');
            }
        }

        return $query;
    }

    /**
     * Optional method manual pemanggilan stock status
     */
    public function getStockStatus()
    {
        return $this->stock_status;
    }
}
