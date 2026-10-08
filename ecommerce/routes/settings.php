<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Teams\TeamController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\Teams\TeamMemberController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Settings and Management Routes
|--------------------------------------------------------------------------
|
| Handles user account management, password updates, two-factor authentication,
| appearance preferences, passkeys, and multi-tenant team administration.
|
*/

// Profile and settings routes that only require standard authentication
Route::middleware(['auth'])->group(function () {
    // Convenience redirect from '/settings' to default tab '/settings/profile'
    Route::redirect('settings', '/settings/profile');

    // Show profile settings page (renders resources/js/pages/settings/profile.tsx)
    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');

    // Update profile information (name, email)
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

// Sensitive settings routes that require both authentication and email verification
Route::middleware(['auth', 'verified'])->group(function () {
    // Delete user account permanently
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    /**
     * Security & Passwords
     *
     * Protected by `RequirePassword::class` so users must confirm their password
     * before accessing sensitive credentials and 2FA tokens.
     */
    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    // Password update endpoint, rate-limited to 6 attempts per minute to prevent brute-force attacks
    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    // Appearance tab (light / dark / system theme selection)
    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    // Team listing and new team creation
    Route::get('settings/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::post('settings/teams', [TeamController::class, 'store'])->name('teams.store');

    /**
     * Team Management Routes
     *
     * Protected by `EnsureTeamMembership::class` to guarantee the authenticated user
     * belongs to the team matching the `{team}` route parameter.
     */
    Route::middleware(EnsureTeamMembership::class)->group(function () {
        // Show team settings, members, and pending invitations
        Route::get('settings/teams/{team}', [TeamController::class, 'edit'])->name('teams.edit');

        // Update team name/metadata
        Route::patch('settings/teams/{team}', [TeamController::class, 'update'])->name('teams.update');

        // Delete team and reassign affected users to their personal team
        Route::delete('settings/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');

        // Switch the active team context in the user's session
        Route::post('settings/teams/{team}/switch', [TeamController::class, 'switch'])->name('teams.switch');

        // Allow a member to voluntarily leave a team
        Route::delete('settings/teams/{team}/leave', [TeamController::class, 'leave'])->name('teams.leave');

        // Update a member's role (admin vs member)
        Route::patch('settings/teams/{team}/members/{user}', [TeamMemberController::class, 'update'])->name('teams.members.update');

        // Remove a member from the team
        Route::delete('settings/teams/{team}/members/{user}', [TeamMemberController::class, 'destroy'])->name('teams.members.destroy');

        // Send a new email invitation to join the team
        Route::post('settings/teams/{team}/invitations', [TeamInvitationController::class, 'store'])->name('teams.invitations.store');

        // Cancel/revoke a pending team invitation
        Route::delete('settings/teams/{team}/invitations/{invitation}', [TeamInvitationController::class, 'destroy'])->name('teams.invitations.destroy');
    });
});

/**
 * WebAuthn / Passkey Discovery Endpoint
 *
 * Exposes a standard well-known JSON endpoint for browsers/authenticators
 * to locate passkey management and enrollment URLs.
 */
Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
