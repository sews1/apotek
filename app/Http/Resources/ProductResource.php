<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $stock = $this->stock ?? 0;
        $minStock = $this->min_stock ?? 0;

        if ($stock <= 0) {
            $status = 'out_of_stock';
        } elseif ($stock <= $minStock) {
            $status = 'low_stock';
        } else {
            $status = 'in_stock';
        }

        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'image' => $this->image,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'selling_price' => $this->selling_price,
            'stock' => $stock,
            'min_stock' => $minStock,
            'unit' => $this->unit,
            'stock_status' => $status, // ← otomatis berdasarkan logika di atas
        ];
    }
}
