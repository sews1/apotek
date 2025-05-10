<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['name' => 'Obat Bebas', 'description' => 'Obat yang bisa dibeli tanpa resep dokter'],
            ['name' => 'Obat Bebas Terbatas', 'description' => 'Obat dengan batasan tertentu'],
            ['name' => 'Obat Keras', 'description' => 'Obat yang memerlukan resep dokter'],
            ['name' => 'Alat Kesehatan', 'description' => 'Berbagai alat medis dan kesehatan'],
            ['name' => 'Perawatan Tubuh', 'description' => 'Produk perawatan tubuh dan kebersihan'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // Tambahkan kategori random untuk development
        Category::factory()
            ->count(5)
            ->create();
    }
}