<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition()
    {
        return [
            'code' => 'PRD-' . $this->faker->unique()->numberBetween(1000, 9999),
            'name' => $this->faker->words(3, true),
            'category_id' => Category::factory(),
            'description' => $this->faker->sentence,
            'purchase_price' => $this->faker->numberBetween(5000, 50000),
            'selling_price' => $this->faker->numberBetween(10000, 100000),
            'stock' => $this->faker->numberBetween(0, 100),
            'min_stock' => $this->faker->numberBetween(5, 20),
            'unit' => $this->faker->randomElement(['tablet', 'botol', 'tube', 'sachet', 'kapsul']),
            'barcode' => $this->faker->optional()->ean13,
        ];
    }
}