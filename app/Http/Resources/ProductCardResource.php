<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The compact product payload used by listing grids, carousels, and the wishlist.
 *
 * @mixin Product
 */
class ProductCardResource extends JsonResource
{
    /**
     * Products created within this many days are flagged as new arrivals.
     */
    public const NEW_ARRIVAL_DAYS = 30;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'brand' => $this->brand,
            'short_description' => $this->short_description,
            'price' => (float) $this->price,
            'compare_price' => $this->isOnSale() ? (float) $this->compare_price : null,
            'discount_percentage' => $this->discountPercentage(),
            'image' => $this->primaryImage(),
            'hover_image' => $this->images[1] ?? null,
            'badge' => $this->badge,
            'rating' => $this->rating,
            'reviews_count' => $this->reviews_count,
            'stock_quantity' => $this->stock_quantity,
            'is_featured' => $this->is_featured,
            'is_new' => $this->created_at?->isAfter(now()->subDays(self::NEW_ARRIVAL_DAYS)) ?? false,
            'colors' => $this->colors ?? [],
            'category' => $this->whenLoaded('category', fn () => [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'subcategory' => $this->whenLoaded('subcategory', fn () => $this->subcategory ? [
                'name' => $this->subcategory->name,
                'slug' => $this->subcategory->slug,
            ] : null),
        ];
    }
}
