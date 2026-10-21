<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSubcategoryRequest;
use App\Models\Subcategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

/**
 * Create, update, and delete subcategories from the categories screen.
 */
class SubcategoryController extends Controller
{
    /**
     * Store a new subcategory.
     */
    public function store(SaveSubcategoryRequest $request): RedirectResponse
    {
        $subcategory = Subcategory::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Subcategory ":name" created.', ['name' => $subcategory->name])]);

        return back();
    }

    /**
     * Update a subcategory. Moving it to another category moves its products too.
     */
    public function update(SaveSubcategoryRequest $request, Subcategory $subcategory): RedirectResponse
    {
        $subcategory->update($request->validated());
        $subcategory->products()->update(['category_id' => $subcategory->category_id]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Subcategory ":name" saved.', ['name' => $subcategory->name])]);

        return back();
    }

    /**
     * Delete a subcategory. Its products stay in the parent category.
     */
    public function destroy(Subcategory $subcategory): RedirectResponse
    {
        $subcategory->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Subcategory ":name" deleted.', ['name' => $subcategory->name])]);

        return back();
    }
}
