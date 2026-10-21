<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;

/**
 * The full product payload used by the product detail page and quick view.
 *
 * @mixin Product
 */
class ProductResource extends ProductCardResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'sku' => $this->sku,
            'description' => $this->description,
            'images' => $this->images ?? [],
            'features' => $this->features ?? [],
        ];
    }
}
