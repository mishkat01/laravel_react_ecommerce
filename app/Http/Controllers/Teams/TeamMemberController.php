<?php

namespace App\Http\Controllers\Teams;

use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teams\UpdateTeamMemberRequest;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

/**
 * TeamMemberController
 *
 * Manages existing members within a team:
 * - Updating a member's role (e.g. promoting from Member to Admin)
 * - Removing a member from the team (with owner safeguards)
 */
class TeamMemberController extends Controller
{
    /**
     * Update the specified team member's role on the team.
     *
     * @param  UpdateTeamMemberRequest  $request  Validates that the role is assignable.
     * @param  Team  $team  The team context.
     * @param  User  $user  The user whose role is being changed.
     * @return RedirectResponse Redirects back to team edit page with toast.
     */
    public function update(UpdateTeamMemberRequest $request, Team $team, User $user): RedirectResponse
    {
        Gate::authorize('updateMember', $team);

        $newRole = TeamRole::from($request->validated('role'));

        // Update the pivot table record connecting user and team
        $team->memberships()
            ->where('user_id', $user->id)
            ->firstOrFail()
            ->update(['role' => $newRole]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Member role updated.')]);

        return to_route('teams.edit', ['team' => $team->slug]);
    }

    /**
     * Remove the specified member from the team.
     *
     * @param  Team  $team  The team context.
     * @param  User  $user  The user to remove.
     */
    public function destroy(Team $team, User $user): RedirectResponse
    {
        Gate::authorize('removeMember', $team);

        // Safeguard: The team owner cannot be kicked out of their own team
        abort_if($team->owner()?->is($user), 403, __('The team owner cannot be removed.'));

        // Delete pivot record
        $team->memberships()
            ->where('user_id', $user->id)
            ->delete();

        // If the removed member is currently active in this team, revert them to their personal team
        if ($user->isCurrentTeam($team)) {
            $user->switchTeam($user->personalTeam());
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Member removed.')]);

        return to_route('teams.edit', ['team' => $team->slug]);
    }
}
