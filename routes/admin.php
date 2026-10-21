<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\Auth\AdminLoginController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\NewsletterSubscriberController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\StorefrontContentController;
use App\Http\Controllers\Admin\SubcategoryController;
use App\Http\Controllers\Admin\UploadController;
use App\Services\StorefrontSettings;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Dedicated route file for administrator authentication and management.
| Unauthenticated admins access the login portal at `/admin`.
| Authenticated admins can access their admin dashboard at `/admin/dashboard`.
|
*/

Route::middleware('guest:admin')->group(function () {
    Route::get('admin', [AdminLoginController::class, 'create'])->name('admin.login');
    Route::get('admin/login', fn () => redirect()->route('admin.login'));
    Route::post('admin', [AdminLoginController::class, 'store'])->name('admin.login.store');
    Route::post('admin/login', [AdminLoginController::class, 'store']);
});

Route::middleware('auth:admin')->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', AdminDashboardController::class)->name('dashboard');
    Route::post('logout', [AdminLoginController::class, 'destroy'])->name('logout');

    // Catalog: products and the category → subcategory tree
    Route::resource('products', ProductController::class)->except('show');
    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('subcategories', SubcategoryController::class)->only(['store', 'update', 'destroy']);

    // Sales: order fulfilment and discount codes
    Route::resource('orders', OrderController::class)->only(['index', 'show', 'update']);
    Route::resource('coupons', CouponController::class)->only(['index', 'store', 'update', 'destroy']);

    // Storefront content: landing page sections, content pages, and newsletter audience
    Route::get('storefront', [StorefrontContentController::class, 'edit'])->name('storefront.edit');
    Route::put('storefront/{section}', [StorefrontContentController::class, 'update'])
        ->whereIn('section', StorefrontSettings::SECTIONS)
        ->name('storefront.update');
    Route::resource('pages', PageController::class)->except('show');
    Route::get('subscribers/export', [NewsletterSubscriberController::class, 'export'])->name('subscribers.export');
    Route::resource('subscribers', NewsletterSubscriberController::class)->only(['index', 'destroy']);

    // Image uploads used by every admin form; returns JSON with the stored URL
    Route::post('uploads', [UploadController::class, 'store'])->middleware('throttle:60,1')->name('uploads.store');
});
