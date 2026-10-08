<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ProfileController
 *
 * Manages user profile information:
 * - Rendering profile edit form (`edit`)
 * - Updating name and email (`update`)
 * - Account deletion with session destruction (`destroy`)
 */
class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     *
     * @param  Request  $request  Incoming HTTP request.
     * @return Response Renders `resources/js/pages/settings/profile.tsx`.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            // Informs React whether this user requires email verification prompts
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            // Flash status message (e.g. 'verification-link-sent')
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     *
     * @param  ProfileUpdateRequest  $request  Validates name and unique email.
     * @return RedirectResponse Redirects back with success flash toast.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        // Populate user model with validated attributes
        $request->user()->fill($request->validated());

        // If the user changed their email, reset verification timestamp so they re-verify
        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account permanently.
     *
     * @param  ProfileDeleteRequest  $request  Validates current password confirmation before allowing deletion.
     * @return RedirectResponse Redirects to public home page.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        // 1. Log the user out
        Auth::logout();

        // 2. Delete user record (cascades or triggers related cleanup)
        $user->delete();

        // 3. Security: Invalidate current session and regenerate CSRF token to prevent session fixation
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
