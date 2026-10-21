<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Services\StorefrontSettings;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the storefront landing page. Every section's copy comes from the admin-managed
 * storefront settings; products and categories come from the catalog.
 */
class HomeController extends Controller
{
    /**
     * Display the landing page.
     */
    public function __invoke(Request $request, StorefrontSettings $settings): Response
    {
        $content = Arr::only($settings->all(), ['hero', 'features', 'categories', 'products', 'deal', 'testimonials', 'newsletter']);
        $productLimit = (int) $content['products']['limit'];

        return Inertia::render('welcome', [
            'content' => $content,
            'heroProduct' => $this->heroProduct($content['hero']['product_id'] ?? null, $request),
            'featuredCategories' => $this->featuredCategories((int) $content['categories']['limit']),
            'productTabs' => [
                'featured' => $this->cards($this->catalog()->where('is_featured', true)->orderBy('sort_order')->latest(), $productLimit, $request),
                'new' => $this->cards($this->catalog()->latest(), $productLimit, $request),
                'bestsellers' => $this->cards($this->catalog()->orderByDesc('sales_count')->orderByDesc('rating'), $productLimit, $request),
                'sale' => $this->cards($this->catalog()->onSale()->orderBy('sort_order'), $productLimit, $request),
            ],
        ]);
    }

    /**
     * Base query for purchasable products with the relations product cards need.
     *
     * @return Builder<Product>
     */
    private function catalog(): Builder
    {
        return Product::query()->active()->with('category:id,name,slug');
    }

    /**
     * Resolve product cards for a query.
     *
     * @param  Builder<Product>  $query
     * @return array<int, array<string, mixed>>
     */
    private function cards(Builder $query, int $limit, Request $request): array
    {
        return ProductCardResource::collection($query->limit($limit)->get())->resolve($request);
    }

    /**
     * The product showcased in the hero: the admin's pick, otherwise the top featured product.
     *
     * @return array<string, mixed>|null
     */
    private function heroProduct(?int $productId, Request $request): ?array
    {
        $product = $productId ? $this->catalog()->find($productId) : null;
        $product ??= $this->catalog()->orderByDesc('is_featured')->orderBy('sort_order')->first();

        return $product ? ProductResource::make($product)->resolve($request) : null;
    }

    /**
     * Categories highlighted on the landing page, falling back to the first active ones.
     *
     * @return array<int, array<string, mixed>>
     */
    private function featuredCategories(int $limit): array
    {
        return Category::query()
            ->active()
            ->orderByDesc('is_featured')
            ->ordered()
            ->withCount(['products' => fn (Builder $query) => $query->where('is_active', true)])
            ->limit($limit)
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category->image,
                'products_count' => $category->products_count,
            ])
            ->all();
    }
}
