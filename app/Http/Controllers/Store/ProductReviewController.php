<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\StoreReviewRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

/**
 * Accepts customer reviews and keeps the product's denormalized rating in sync.
 */
class ProductReviewController extends Controller
{
    /**
     * Store a review for the product.
     */
    public function store(StoreReviewRequest $request, Product $product): RedirectResponse
    {
        $user = $request->user();

        $product->reviews()->create([
            ...$request->validated(),
            'user_id' => $user->id,
            'is_verified' => $user->hasPurchased($product),
        ]);

        $product->refreshRating();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Thanks for your review!')]);

        return back();
    }
}
