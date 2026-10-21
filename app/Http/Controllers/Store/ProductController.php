<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use App\Models\Subcategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Product listing (`/shop`) and product detail pages.
 *
 * The listing follows common e-commerce conventions: every filter, the sort order, and
 * the page live in the query string so results are shareable and survive refreshes.
 */
class ProductController extends Controller
{
    /**
     * Products shown per listing page.
     */
    public const PER_PAGE = 12;

    /**
     * Allowed sort keys mapped to their order-by columns.
     *
     * @var array<string, array{0: string, 1: string}>
     */
    private const SORTS = [
        'featured' => ['is_featured', 'desc'],
        'newest' => ['created_at', 'desc'],
        'price_asc' => ['price', 'asc'],
        'price_desc' => ['price', 'desc'],
        'rating' => ['rating', 'desc'],
        'popular' => ['sales_count', 'desc'],
    ];

    /**
     * Display the filterable product listing.
     */
    public function index(Request $request): Response
    {
        $filters = $this->filters($request);

        $category = $filters['category']
            ? Category::query()->active()->where('slug', $filters['category'])->first()
            : null;

        $subcategory = $category && $filters['subcategory']
            ? $category->subcategories()->active()->where('slug', $filters['subcategory'])->first()
            : null;

        [$sortColumn, $sortDirection] = self::SORTS[$filters['sort']];

        $products = $this->scopedQuery($category, $subcategory)
            ->with(['category:id,name,slug', 'subcategory:id,name,slug'])
            ->when($filters['q'], fn (Builder $query, string $term) => $query->where(fn (Builder $query) => $query
                ->where('name', 'like', "%{$term}%")
                ->orWhere('brand', 'like', "%{$term}%")
                ->orWhere('short_description', 'like', "%{$term}%")
                ->orWhere('sku', 'like', "%{$term}%")))
            ->when($filters['brands'], fn (Builder $query, array $brands) => $query->whereIn('brand', $brands))
            ->when($filters['min_price'] !== null, fn (Builder $query) => $query->where('price', '>=', $filters['min_price']))
            ->when($filters['max_price'] !== null, fn (Builder $query) => $query->where('price', '<=', $filters['max_price']))
            ->when($filters['rating'], fn (Builder $query, int $rating) => $query->where('rating', '>=', $rating))
            ->when($filters['in_stock'], fn (Builder $query) => $query->where('stock_quantity', '>', 0))
            ->when($filters['on_sale'], fn (Builder $query) => $query->onSale())
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('store/shop', [
            'products' => ProductCardResource::collection($products),
            'filters' => $filters,
            'facets' => $this->facets($category, $subcategory),
            'activeCategory' => $category?->only(['id', 'name', 'slug', 'description', 'image']),
            'activeSubcategory' => $subcategory?->only(['id', 'name', 'slug', 'description']),
        ]);
    }

    /**
     * Display a single product.
     */
    public function show(Request $request, Product $product): Response
    {
        $product->load(['category', 'subcategory']);

        abort_unless($product->is_active && $product->category->is_active, 404);

        $user = $request->user();

        $relatedProducts = Product::query()
            ->active()
            ->with('category:id,name,slug')
            ->whereKeyNot($product->id)
            ->where('category_id', $product->category_id)
            ->orderByRaw('subcategory_id = ? desc', [$product->subcategory_id ?? 0])
            ->orderByDesc('sales_count')
            ->limit(4)
            ->get();

        $ratingCounts = $product->reviews()
            ->selectRaw('rating, count(*) as aggregate')
            ->groupBy('rating')
            ->pluck('aggregate', 'rating');

        return Inertia::render('store/product', [
            'product' => ProductResource::make($product)->resolve($request),
            'breadcrumbs' => [
                'category' => $product->category->only(['name', 'slug']),
                'subcategory' => $product->subcategory?->only(['name', 'slug']),
            ],
            'reviews' => $product->reviews()
                ->with('user:id,name')
                ->latest()
                ->limit(20)
                ->get()
                ->map(fn (Review $review) => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'body' => $review->body,
                    'author' => $review->user->name,
                    'is_verified' => $review->is_verified,
                    'created_at' => $review->created_at?->toIso8601String(),
                ]),
            'ratingBreakdown' => collect([5, 4, 3, 2, 1])
                ->map(fn (int $stars) => ['stars' => $stars, 'count' => (int) ($ratingCounts[$stars] ?? 0)]),
            'relatedProducts' => ProductCardResource::collection($relatedProducts)->resolve($request),
            'canReview' => $user !== null && ! $product->reviews()->whereBelongsTo($user)->exists(),
        ]);
    }

    /**
     * Normalize the query string into a predictable filter payload. Unknown or malformed
     * values fall back to defaults instead of erroring, as shoppers edit URLs by hand.
     *
     * @return array{q: string|null, category: string|null, subcategory: string|null, brands: list<string>, min_price: float|null, max_price: float|null, rating: int|null, in_stock: bool, on_sale: bool, sort: string}
     */
    private function filters(Request $request): array
    {
        $rating = (int) $request->query('rating');
        $sort = $request->query('sort');

        return [
            'q' => trim((string) $request->string('q')) ?: null,
            'category' => $request->string('category')->toString() ?: null,
            'subcategory' => $request->string('subcategory')->toString() ?: null,
            'brands' => array_values(array_filter((array) $request->query('brands', []), 'is_string')),
            'min_price' => is_numeric($request->query('min_price')) ? (float) $request->query('min_price') : null,
            'max_price' => is_numeric($request->query('max_price')) ? (float) $request->query('max_price') : null,
            'rating' => $rating >= 1 && $rating <= 4 ? $rating : null,
            'in_stock' => $request->boolean('in_stock'),
            'on_sale' => $request->boolean('on_sale'),
            'sort' => is_string($sort) && array_key_exists($sort, self::SORTS) ? $sort : 'featured',
        ];
    }

    /**
     * Purchasable products narrowed to the selected category and subcategory.
     *
     * @return Builder<Product>
     */
    private function scopedQuery(?Category $category, ?Subcategory $subcategory): Builder
    {
        return Product::query()
            ->active()
            ->when($category, fn (Builder $query) => $query->whereBelongsTo($category))
            ->when($subcategory, fn (Builder $query) => $query->whereBelongsTo($subcategory));
    }

    /**
     * Sidebar facets with product counts, scoped to the selected category.
     *
     * @return array<string, mixed>
     */
    private function facets(?Category $category, ?Subcategory $subcategory): array
    {
        $priceRange = $this->scopedQuery($category, $subcategory)
            ->toBase()
            ->selectRaw('min(price) as min_price, max(price) as max_price')
            ->first();

        return [
            'categories' => Category::query()
                ->active()
                ->ordered()
                ->withCount(['products' => fn (Builder $query) => $query->where('is_active', true)])
                ->get(['id', 'name', 'slug'])
                ->map(fn (Category $item) => $item->only(['id', 'name', 'slug', 'products_count'])),
            'subcategories' => $category
                ? $category->subcategories()
                    ->active()
                    ->withCount(['products' => fn (Builder $query) => $query->where('is_active', true)])
                    ->get(['id', 'name', 'slug'])
                    ->map(fn (Subcategory $item) => $item->only(['id', 'name', 'slug', 'products_count']))
                : [],
            'brands' => $this->scopedQuery($category, $subcategory)
                ->whereNotNull('brand')
                ->toBase()
                ->selectRaw('brand as name, count(*) as count')
                ->groupBy('brand')
                ->orderBy('brand')
                ->get(),
            'price' => [
                'min' => (float) floor((float) ($priceRange->min_price ?? 0)),
                'max' => (float) ceil((float) ($priceRange->max_price ?? 0)),
            ],
        ];
    }
}
