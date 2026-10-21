<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Catalog management: list, create, edit, and delete products.
 */
class ProductController extends Controller
{
    /**
     * Display the product list.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->string('q')) ?: null,
            'category' => $request->integer('category') ?: null,
            'status' => in_array($request->query('status'), ['active', 'draft', 'low_stock', 'out_of_stock'], true)
                ? $request->query('status')
                : null,
        ];

        $products = Product::query()
            ->with(['category:id,name', 'subcategory:id,name'])
            ->when($filters['q'], fn (Builder $query, string $term) => $query->where(fn (Builder $query) => $query
                ->where('name', 'like', "%{$term}%")
                ->orWhere('sku', 'like', "%{$term}%")
                ->orWhere('brand', 'like', "%{$term}%")))
            ->when($filters['category'], fn (Builder $query, int $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['status'], fn (Builder $query, string $status) => match ($status) {
                'active' => $query->where('is_active', true),
                'draft' => $query->where('is_active', false),
                'low_stock' => $query->whereBetween('stock_quantity', [1, Product::LOW_STOCK_THRESHOLD]),
                'out_of_stock' => $query->where('stock_quantity', 0),
            })
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'brand' => $product->brand,
                'image' => $product->primaryImage(),
                'price' => (float) $product->price,
                'compare_price' => $product->compare_price !== null ? (float) $product->compare_price : null,
                'stock_quantity' => $product->stock_quantity,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'rating' => $product->rating,
                'sales_count' => $product->sales_count,
                'category' => $product->category->name,
                'subcategory' => $product->subcategory?->name,
            ]);

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => $filters,
            'categories' => Category::query()->ordered()->get(['id', 'name']),
            'lowStockThreshold' => Product::LOW_STOCK_THRESHOLD,
        ]);
    }

    /**
     * Show the form for creating a product.
     */
    public function create(): Response
    {
        return Inertia::render('admin/products/form', [
            'product' => null,
            'categories' => $this->categoryOptions(),
        ]);
    }

    /**
     * Store a new product.
     */
    public function store(SaveProductRequest $request): RedirectResponse
    {
        $product = Product::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('":name" created.', ['name' => $product->name])]);

        return to_route('admin.products.index');
    }

    /**
     * Show the form for editing a product.
     */
    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/form', [
            'product' => [
                ...$product->only([
                    'id', 'name', 'slug', 'category_id', 'subcategory_id', 'brand', 'short_description',
                    'description', 'sku', 'stock_quantity', 'badge', 'is_active', 'is_featured', 'sort_order',
                ]),
                'price' => (string) $product->price,
                'compare_price' => $product->compare_price !== null ? (string) $product->compare_price : '',
                'images' => $product->images ?? [],
                'colors' => $product->colors ?? [],
                'features' => $product->features ?? [],
            ],
            'categories' => $this->categoryOptions(),
        ]);
    }

    /**
     * Update a product.
     */
    public function update(SaveProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('":name" saved.', ['name' => $product->name])]);

        return to_route('admin.products.index');
    }

    /**
     * Delete a product. Past orders keep their snapshot of the product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('":name" deleted.', ['name' => $product->name])]);

        return to_route('admin.products.index');
    }

    /**
     * Categories with their subcategories for the cascading selects.
     *
     * @return array<int, array{id: int, name: string, subcategories: array<int, array{id: int, name: string}>}>
     */
    private function categoryOptions(): array
    {
        return Category::query()
            ->ordered()
            ->with('subcategories:id,category_id,name,sort_order')
            ->get(['id', 'name'])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'subcategories' => $category->subcategories
                    ->map(fn (Subcategory $subcategory) => ['id' => $subcategory->id, 'name' => $subcategory->name])
                    ->all(),
            ])
            ->all();
    }
}
