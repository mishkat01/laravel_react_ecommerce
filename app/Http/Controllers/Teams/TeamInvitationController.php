<?php

namespace App\Http\Controllers\Teams;

use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teams\CreateTeamInvitationRequest;
use App\Http\Requests\Teams\RespondToTeamInvitationRequest;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Notifications\Teams\TeamInvitation as TeamInvitationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

/**
 * TeamInvitationController
 *
 * Handles the lifecycle of team member invitations:
 * - Sending new email invitations (`store`)
 * - Revoking pending invitations (`destroy`)
 * - Accepting invitations by invited users (`accept`)
 * - Declining invitations (`decline`)
 */
class TeamInvitationController extends Controller
{
    /**
     * Store and send a newly created invitation to a prospective member.
     *
     * @param  CreateTeamInvitationRequest  $request  Validates email format and valid role string.
     * @param  Team  $team  Team for which the invitation is being created.
     * @return RedirectResponse Redirects back to team edit page with success toast.
     */
    public function store(CreateTeamInvitationRequest $request, Team $team): RedirectResponse
    {
        // Enforce authorization policy: user must have permission to invite members to this team
        Gate::authorize('inviteMember', $team);

        // Create the invitation record in the database with a 3-day expiration timestamp
        $invitation = $team->invitations()->create([
            'email' => $request->validated('email'),
            'role' => TeamRole::from($request->validated('role')),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(3),
        ]);

        // Send transactional email containing invitation link and join instructions
        Notification::route('mail', $invitation->email)
            ->notify(new TeamInvitationNotification($invitation));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invitation sent.')]);

        return to_route('teams.edit', ['team' => $team->slug]);
    }

    /**
     * Cancel/revoke an unaccepted team invitation.
     *
     * @param  Team  $team  The team managing the invitation.
     * @param  TeamInvitation  $invitation  The invitation record to delete.
     * @return RedirectResponse Redirects back to team edit page.
     */
    public function destroy(Team $team, TeamInvitation $invitation): RedirectResponse
    {
        // Ensure the invitation genuinely belongs to this team (prevent cross-team ID tampering)
        abort_unless($invitation->team_id === $team->id, 404);

        Gate::authorize('cancelInvitation', $team);

        $invitation->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invitation cancelled.')]);

        return to_route('teams.edit', ['team' => $team->slug]);
    }

    /**
     * Accept a pending invitation and join the team.
     *
     * @param  RespondToTeamInvitationRequest  $request  Validates that invitation is active & belongs to user.
     * @param  TeamInvitation  $invitation  The invitation being accepted.
     * @return RedirectResponse Redirects to user's dashboard in the new team context.
     */
    public function accept(RespondToTeamInvitationRequest $request, TeamInvitation $invitation): RedirectResponse
    {
        $user = $request->user();

        // Atomically create the membership and mark the invitation accepted
        DB::transaction(function () use ($user, $invitation) {
            $team = $invitation->team;

            // Add user to team pivot table with the invited role
            $team->memberships()->firstOrCreate(
                ['user_id' => $user->id],
                ['role' => $invitation->role],
            );

            // Record timestamp when invitation was accepted
            $invitation->update(['accepted_at' => now()]);

            // Automatically switch the user's active session to this team
            $user->switchTeam($team);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invitation accepted.')]);

        return to_route('dashboard');
    }

    /**
     * Decline and discard a team invitation.
     *
     * @param  RespondToTeamInvitationRequest  $request  Validates invitation.
     * @param  TeamInvitation  $invitation  The invitation to reject.
     * @return RedirectResponse Redirects back to dashboard.
     */
    public function decline(RespondToTeamInvitationRequest $request, TeamInvitation $invitation): RedirectResponse
    {
        $invitation->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invitation declined.')]);

        return to_route('dashboard');
    }
}
