<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Obat Bebas',
                'kode_prefix' => 'OBS',
                'last_code' => 'OBS-012',
                'description' => 'Obat yang bisa dibeli tanpa resep dokter',
            ],
            [
                'name' => 'Obat Bebas Terbatas',
                'kode_prefix' => 'OBT',
                'last_code' => 'OBT-005',
                'description' => 'Obat dengan batasan tertentu',
            ],
            [
                'name' => 'Obat Keras',
                'kode_prefix' => 'OBK',
                'last_code' => 'OBK-001',
                'description' => 'Obat yang memerlukan resep dokter',
            ],
            [
                'name' => 'Alat Kesehatan',
                'kode_prefix' => 'ALKES',
                'description' => 'Berbagai alat medis dan kesehatan',
            ],
            [
                'name' => 'Perawatan Tubuh',
                'kode_prefix' => 'PRW',
                'description' => 'Produk perawatan tubuh dan kebersihan',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }

        // Tambahkan kategori random untuk development
        Category::factory()
            ->count(5)
            ->create();
    }
}
