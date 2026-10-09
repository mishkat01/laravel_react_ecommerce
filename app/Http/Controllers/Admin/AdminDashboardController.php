<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
            ],
            'recentUsers' => User::latest()
                ->take(5)
                ->get(['id', 'name', 'email', 'created_at']),
        ]);
    }
}
