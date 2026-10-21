<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCategoryRequest;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Manage the catalog tree. Subcategories are edited inline on the same page.
 */
class CategoryController extends Controller
{
    /**
     * Display categories with their subcategories.
     */
    public function index(): Response
    {
        $categories = Category::query()
            ->ordered()
            ->withCount('products')
            ->with(['subcategories' => fn ($query) => $query->withCount('products')])
            ->get()
            ->map(fn (Category $category) => [
                ...$category->only(['id', 'name', 'slug', 'description', 'image', 'is_active', 'is_featured', 'sort_order', 'products_count']),
                'subcategories' => $category->subcategories->map(fn (Subcategory $subcategory) => $subcategory->only([
                    'id', 'category_id', 'name', 'slug', 'description', 'is_active', 'sort_order', 'products_count',
                ])),
            ]);

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a new category.
     */
    public function store(SaveCategoryRequest $request): RedirectResponse
    {
        $category = Category::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category ":name" created.', ['name' => $category->name])]);

        return back();
    }

    /**
     * Update a category.
     */
    public function update(SaveCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category ":name" saved.', ['name' => $category->name])]);

        return back();
    }

    /**
     * Delete a category. Categories that still hold products are protected.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Move or delete the products in ":name" first.', ['name' => $category->name])]);

            return back();
        }

        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category ":name" deleted.', ['name' => $category->name])]);

        return back();
    }
}
