<?php

namespace App\Http\Controllers;

use App\Models\TeamInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * DashboardController
 *
 * This is a Single Action Controller (using PHP's magic `__invoke()` method).
 * It handles the GET /{current_team}/dashboard route.
 *
 * Role in React + Laravel:
 * 1. Fetches server data from the database using Eloquent ORM.
 * 2. Formats and filters the data specifically for the React view.
 * 3. Renders the React page component at `resources/js/pages/dashboard.tsx`
 *    and supplies `pendingInvitations` as a component prop.
 */
class DashboardController extends Controller
{
    /**
     * Handle the incoming request to display the dashboard.
     *
     * @param  Request  $request  The current HTTP request containing the authenticated user.
     * @return Response Inertia response that instructs the client to render `dashboard.tsx`.
     */
    public function __invoke(Request $request): Response
    {
        // Normalize user email to lowercase for case-insensitive query matching
        $email = strtolower($request->user()->email);

        /**
         * Fetch pending, unexpired team invitations addressed to this user:
         * - with(['inviter', 'team']): Eager-loads related inviter and team models (prevents N+1 query problem).
         * - whereRaw('LOWER(email) = ?'): Case-insensitive email comparison.
         * - whereNull('accepted_at'): Ensures the invitation has not already been accepted.
         * - where(fn ($query) => ...): Checks that expiration date is either null or in the future.
         * - latest(): Orders by creation timestamp descending.
         */
        $pendingInvitations = TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()))
            ->latest()
            ->get()
            // Map Eloquent models into a clean, lightweight array payload for the React component
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->inviter->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]);

        /**
         * Inertia::render()
         * - Argument 1: Page component name ('dashboard' -> resources/js/pages/dashboard.tsx)
         * - Argument 2: Associative array of props passed directly to the React component
         */
        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
        ]);
    }
}
