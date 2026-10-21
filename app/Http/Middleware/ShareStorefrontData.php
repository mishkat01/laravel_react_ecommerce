<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Subcategory;
use App\Services\Cart;
use App\Services\StorefrontSettings;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * ShareStorefrontData Middleware
 *
 * Shares the props every storefront page needs (announcement bar, footer, category
 * navigation, cart, wishlist) only on storefront routes, so admin and account pages
 * don't pay for queries they never render.
 */
class ShareStorefrontData
{
    public function __construct(private StorefrontSettings $settings, private Cart $cart) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Inertia::share([
            'announcement' => fn () => $this->settings->section('announcement'),
            'footer' => fn () => $this->settings->section('footer'),
            'navigation' => fn () => Category::query()
                ->active()
                ->ordered()
                ->with(['subcategories' => fn ($query) => $query->active()])
                ->get()
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'image' => $category->image,
                    'subcategories' => $category->subcategories->map(fn (Subcategory $subcategory) => [
                        'id' => $subcategory->id,
                        'name' => $subcategory->name,
                        'slug' => $subcategory->slug,
                    ]),
                ]),
            'cart' => fn () => $this->cart->summary(),
            'wishlist' => fn () => $request->user()?->wishlist()->pluck('products.id') ?? [],
        ]);

        return $next($request);
    }
}
