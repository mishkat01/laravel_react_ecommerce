<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
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
 * Public Landing / Storefront Route
 *
 * `Route::inertia(uri, component)` is an Inertia shortcut that returns an Inertia response
 * without needing a dedicated controller.
 * - URI: '/'
 * - Component: 'welcome' -> maps to `resources/js/pages/welcome.tsx`
 * - Route Name: 'home' -> can be referenced via `route('home')` or Wayfinder
 */
Route::inertia('/', 'welcome')->name('home');

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
