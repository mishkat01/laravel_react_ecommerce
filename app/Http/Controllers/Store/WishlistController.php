<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The signed-in customer's saved products.
 */
class WishlistController extends Controller
{
    /**
     * Display the wishlist.
     */
    public function index(Request $request): Response
    {
        $products = $request->user()
            ->wishlist()
            ->active()
            ->with('category:id,name,slug')
            ->latest('wishlists.created_at')
            ->get();

        return Inertia::render('account/wishlist', [
            'products' => ProductCardResource::collection($products)->resolve($request),
        ]);
    }

    /**
     * Save a product to the wishlist.
     */
    public function store(Request $request, Product $product): RedirectResponse
    {
        $request->user()->wishlist()->syncWithoutDetaching([$product->id]);

        return back();
    }

    /**
     * Remove a product from the wishlist.
     */
    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $request->user()->wishlist()->detach($product->id);

        return back();
    }
}
