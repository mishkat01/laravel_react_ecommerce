<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

/**
 * HandleInertiaRequests Middleware
 *
 * This middleware is the bridge between Laravel and the React frontend.
 * Whenever Inertia handles a request, this class:
 * 1. Specifies the root Blade template (`app.blade.php`) that hosts React.
 * 2. Checks asset versioning (so outdated client SPAs automatically refresh when Vite builds new assets).
 * 3. Defines "Shared Props": Global data injected into EVERY React page component automatically!
 *    In React, any component can read this via `const { auth, currentTeam, teams } = usePage().props;`.
 */
class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     * Maps to `resources/views/app.blade.php`.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     * In production, when Vite builds new JS/CSS bundles with new hashes,
     * Inertia detects the version mismatch and forces a hard refresh to load the latest JS.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * Any data returned in this array is accessible on the client side in React
     * using the `usePage<SharedData>().props` hook.
     *
     * Performance Tip: Passing a closure `fn () => ...` makes prop evaluation lazy!
     * The database query or computation will ONLY execute if the prop is requested,
     * preventing unnecessary work on requests that don't need it.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Get currently authenticated User instance (or null if guest)
        $user = $request->user();

        return [
            // Merge defaults from Inertia base middleware (e.g. validation errors, flash messages)
            ...parent::share($request),

            // Application name from config/app.php
            'name' => config('app.name'),

            // Authenticated user object shared with React auth hooks & UI
            'auth' => [
                'user' => $user,
            ],

            // Sidebar open/collapsed state saved in cookie for seamless UI rendering
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',

            // Active team context (lazily evaluated: only formatted if user is logged in)
            'currentTeam' => fn () => $user?->currentTeam ? $user->toUserTeam($user->currentTeam) : null,

            // List of all teams the user belongs to (for team switcher dropdown)
            'teams' => fn () => $user?->toUserTeams(includeCurrent: true) ?? [],
        ];
    }
}
