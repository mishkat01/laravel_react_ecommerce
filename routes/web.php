<?php

use App\Http\Controllers\Account\OrderController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CartCouponController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\HomeController;
use App\Http\Controllers\Store\NewsletterSubscriptionController;
use App\Http\Controllers\Store\PageController;
use App\Http\Controllers\Store\ProductController;
use App\Http\Controllers\Store\ProductReviewController;
use App\Http\Controllers\Store\WishlistController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use App\Http\Middleware\ShareStorefrontData;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (Laravel + Inertia.js + React)
|--------------------------------------------------------------------------
|
| Here is where you register web routes for your application.
| In an Inertia + React application:
| 1. Laravel handles HTTP routing, session state, CSRF protection, and authentication.
| 2. Instead of returning Blade HTML views or raw JSON APIs, Laravel routes render
|    Inertia responses (e.g. `Route::inertia()` or `Inertia::render()`).
| 3. Inertia sends an initial HTML page on the first load, and subsequent navigation
|    is handled seamlessly via client-side AJAX visits that update React components
|    without a full browser refresh.
|
*/

/**
 * Public Storefront Routes
 *
 * `ShareStorefrontData` shares the navigation, announcement bar, footer, cart, and wishlist
 * with every storefront page. Browsing and the cart are open to guests; checkout, the
 * wishlist, and reviews require a signed-in customer.
 */
Route::middleware(ShareStorefrontData::class)->group(function () {
    // Landing page (renders resources/js/pages/welcome.tsx with admin-managed content)
    Route::get('/', HomeController::class)->name('home');

    // Catalog browsing
    Route::get('shop', [ProductController::class, 'index'])->name('shop.index');
    Route::get('products/{product:slug}', [ProductController::class, 'show'])->name('products.show');
    Route::get('pages/{page:slug}', PageController::class)->name('pages.show');

    // Session cart
    Route::post('cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('cart/{line}', [CartController::class, 'update'])->where('line', '[a-f0-9]{12}')->name('cart.update');
    Route::delete('cart/{line}', [CartController::class, 'destroy'])->where('line', '[a-f0-9]{12}')->name('cart.destroy');
    Route::delete('cart', [CartController::class, 'clear'])->name('cart.clear');
    Route::post('cart/coupon', [CartCouponController::class, 'store'])->middleware('throttle:10,1')->name('cart.coupon.store');
    Route::delete('cart/coupon', [CartCouponController::class, 'destroy'])->name('cart.coupon.destroy');

    Route::post('newsletter', [NewsletterSubscriptionController::class, 'store'])->middleware('throttle:6,1')->name('newsletter.store');

    Route::middleware('auth')->group(function () {
        Route::get('checkout', [CheckoutController::class, 'create'])->name('checkout.create');
        Route::post('checkout', [CheckoutController::class, 'store'])->middleware('throttle:10,1')->name('checkout.store');

        Route::post('wishlist/{product}', [WishlistController::class, 'store'])->name('wishlist.store');
        Route::delete('wishlist/{product}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');

        Route::post('products/{product:slug}/reviews', [ProductReviewController::class, 'store'])
            ->middleware('throttle:6,1')
            ->name('products.reviews.store');
    });
});

/**
 * Customer Account Routes
 *
 * Order history and the wishlist render inside the authenticated app shell (AppLayout).
 */
Route::middleware('auth')->prefix('account')->name('account.')->group(function () {
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::get('wishlist', [WishlistController::class, 'index'])->name('wishlist');
});

/**
 * Team-Scoped Authenticated Routes
 *
 * These routes require the user to be:
 * 1. `auth` - Logged in through Laravel's session authentication.
 * 2. `verified` - Have their email address verified (if verification is enabled).
 * 3. `EnsureTeamMembership::class` - Verified as an active member of the requested `{current_team}` slug.
 *
 * Route prefix `{current_team}` puts the team slug in the URL (e.g. `/my-team/dashboard`).
 */
Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        /**
         * Team Dashboard
         *
         * Invokes `DashboardController::__invoke()`, which fetches pending team invitations
         * and renders `resources/js/pages/dashboard.tsx` with server-side props.
         */
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

/**
 * Team Invitation Response Routes
 *
 * Routes for accepting or declining an invitation to join another team.
 * Accessible to any authenticated user.
 */
Route::middleware(['auth'])->group(function () {
    // Accepts a team invitation using the unique invitation code
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');

    // Declines (or cancels) a team invitation
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

// Load modular settings and team management routes
require __DIR__.'/settings.php';
