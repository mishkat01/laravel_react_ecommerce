<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Product Model
 *
 * A sellable catalog item. Prices are stored as decimals, `compare_price` holds the
 * original price when the product is on sale, and `rating` / `reviews_count` are
 * denormalized from the reviews table so listings can filter and sort on them cheaply.
 *
 * @property int $id
 * @property int $category_id
 * @property int|null $subcategory_id
 * @property string $name
 * @property string $slug
 * @property string|null $brand
 * @property string|null $short_description
 * @property string|null $description
 * @property string $price
 * @property string|null $compare_price
 * @property string|null $sku
 * @property int $stock_quantity
 * @property array<int, string>|null $images
 * @property array<int, array{name: string, hex: string}>|null $colors
 * @property array<int, string>|null $features
 * @property string|null $badge
 * @property bool $is_active
 * @property bool $is_featured
 * @property float $rating
 * @property int $reviews_count
 * @property int $sales_count
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category $category
 * @property-read Subcategory|null $subcategory
 * @property-read Collection<int, Review> $reviews
 */
#[Fillable([
    'category_id',
    'subcategory_id',
    'name',
    'slug',
    'brand',
    'short_description',
    'description',
    'price',
    'compare_price',
    'sku',
    'stock_quantity',
    'images',
    'colors',
    'features',
    'badge',
    'is_active',
    'is_featured',
    'sort_order',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    /**
     * Number of units at or below which a product counts as low stock.
     */
    public const LOW_STOCK_THRESHOLD = 5;

    /**
     * The category the product belongs to.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * The optional subcategory the product belongs to.
     *
     * @return BelongsTo<Subcategory, $this>
     */
    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }

    /**
     * Customer reviews for the product.
     *
     * @return HasMany<Review, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Only include products that are published and whose category is published.
     *
     * @param  Builder<Product>  $query
     */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('products.is_active', true)
            ->whereHas('category', fn (Builder $category) => $category->where('is_active', true));
    }

    /**
     * Only include products discounted below their compare-at price.
     *
     * @param  Builder<Product>  $query
     */
    #[Scope]
    protected function onSale(Builder $query): void
    {
        $query->whereNotNull('compare_price')->whereColumn('compare_price', '>', 'price');
    }

    /**
     * Get the primary image URL.
     */
    public function primaryImage(): ?string
    {
        return $this->images[0] ?? null;
    }

    /**
     * Determine if the product is discounted.
     */
    public function isOnSale(): bool
    {
        return $this->compare_price !== null && (float) $this->compare_price > (float) $this->price;
    }

    /**
     * Get the discount percentage relative to the compare-at price.
     */
    public function discountPercentage(): ?int
    {
        if (! $this->isOnSale()) {
            return null;
        }

        return (int) round((1 - (float) $this->price / (float) $this->compare_price) * 100);
    }

    /**
     * Determine if at least one unit is available.
     */
    public function isInStock(): bool
    {
        return $this->stock_quantity > 0;
    }

    /**
     * Determine if the given color is one of the product's variants.
     */
    public function hasColor(?string $color): bool
    {
        if (empty($this->colors)) {
            return $color === null;
        }

        return collect($this->colors)->contains('name', $color);
    }

    /**
     * Recalculate the denormalized rating and review count from the reviews table.
     */
    public function refreshRating(): void
    {
        $this->forceFill([
            'rating' => round((float) $this->reviews()->avg('rating'), 2),
            'reviews_count' => $this->reviews()->count(),
        ])->save();
    }

    /**
     * Get the attributes that should be cast to native types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'images' => 'array',
            'colors' => 'array',
            'features' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'rating' => 'float',
            'reviews_count' => 'integer',
            'sales_count' => 'integer',
            'sort_order' => 'integer',
        ];
    }
}
