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
        'entry_date',      // Ditambahkan
        'expired_date',    // Ditambahkan
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'entry_date' => 'date',       // Casting ke objek tanggal
        'expired_date' => 'date',     // Casting ke objek tanggal
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getStockStatusAttribute()
    {
        if ($this->stock <= 0) {
            return 'out_of_stock';
        } elseif ($this->stock < $this->min_stock) {
            return 'low_stock';
        }
        return 'in_stock';
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock', '<', 'min_stock');
    }

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

    // Optional, sudah ada accessor getStockStatusAttribute di atas
    public function getStockStatus()
    {
        return $this->getStockStatusAttribute();
    }
}
