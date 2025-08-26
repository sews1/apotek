<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'kode_prefix',
        'last_code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relasi: satu kategori memiliki banyak produk
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Scope untuk hanya mengambil kategori yang aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope untuk filter berdasarkan pencarian nama dan soft delete
     */
    public function scopeFilter($query, array $filters)
    {
        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['trashed'])) {
            if ($filters['trashed'] === 'with') {
                $query->withTrashed();
            } elseif ($filters['trashed'] === 'only') {
                $query->onlyTrashed();
            }
        }

        return $query;
    }
}
