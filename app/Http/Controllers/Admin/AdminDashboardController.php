<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function __invoke(Request $request): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => User::count(),
                'totalTeams' => Team::count(),
                'totalAdmins' => Admin::count(),
            ],
            'recentUsers' => User::latest()
                ->take(8)
                ->get(['id', 'name', 'email', 'email_verified_at', 'created_at']),
            'systemInfo' => [
                'phpVersion' => PHP_VERSION,
                'laravelVersion' => app()->version(),
                'environment' => app()->environment(),
                'serverTime' => now()->toIso8601String(),
                'dbDriver' => config('database.default'),
            ],
        ]);
    }
}
