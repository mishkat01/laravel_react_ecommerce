<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\Auth\AdminLoginController;
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
});
