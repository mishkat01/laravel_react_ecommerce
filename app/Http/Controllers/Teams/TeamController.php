<?php

namespace App\Http\Controllers\Teams;

use App\Actions\Teams\CreateTeam;
use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teams\DeleteTeamRequest;
use App\Http\Requests\Teams\SaveTeamRequest;
use App\Models\Membership;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * TeamController
 *
 * Manages full CRUD operations for multi-tenant teams:
 * - Listing teams (`index`)
 * - Creating teams (`store`)
 * - Displaying team settings and member lists (`edit`)
 * - Updating team names (`update`)
 * - Switching active team context (`switch`)
 * - Leaving a team (`leave`)
 * - Deleting a team (`destroy`)
 *
 * Demonstrates key Laravel + Inertia patterns:
 * 1. `Inertia::flash('toast', ...)`: sends flash data to client toasts.
 * 2. `Gate::authorize()`: enforces fine-grained authorization policies.
 * 3. Database transactions with `DB::transaction()` and pessimistic locking `lockForUpdate()`.
 * 4. Transforming Eloquent relations and pivot models into clean JSON arrays for React.
 */
class TeamController extends Controller
{
    /**
     * Display a listing of the user's teams.
     *
     * @param  Request  $request  Incoming HTTP request.
     * @return Response Renders `resources/js/pages/teams/index.tsx`.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('teams/index', [
            'teams' => $user->toUserTeams(includeCurrent: true),
        ]);
    }

    /**
     * Store a newly created team.
     *
     * @param  SaveTeamRequest  $request  Validated form request ensuring name requirements.
     * @param  CreateTeam  $createTeam  Domain action that encapsulates team creation and role assignment.
     * @return RedirectResponse Redirects to the edit screen of the newly created team.
     */
    public function store(SaveTeamRequest $request, CreateTeam $createTeam): RedirectResponse
    {
        // Execute the action to create the team record and make current user the Owner
        $team = $createTeam->handle($request->user(), $request->validated('name'));

        // Flash message consumed by React's Sonner toast hook (`useFlashToast`)
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team created.')]);

        return to_route('teams.edit', ['team' => $team->slug]);
    }

    /**
     * Show the team settings and members edit page.
     *
     * @param  Request  $request  Incoming HTTP request.
     * @param  Team  $team  Implicit route model binding: resolves team by `{team}` slug or ID.
     * @return Response Renders `resources/js/pages/teams/edit.tsx` with members and permissions.
     */
    public function edit(Request $request, Team $team): Response
    {
        $user = $request->user();

        return Inertia::render('teams/edit', [
            // Core team details
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'isPersonal' => $team->is_personal,
            ],
            // Member list with pivot table data (role on this team)
            'members' => $team->members()->get()->map(function (User $member) {
                /** @var Membership $membership */
                $membership = $member->getRelation('pivot');

                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'avatar' => $member->avatar ?? null,
                    'role' => $membership->role->value,
                    'role_label' => $membership->role->label(),
                ];
            }),
            // Pending unaccepted invitations
            'invitations' => $team->invitations()
                ->whereNull('accepted_at')
                ->get()
                ->map(fn ($invitation) => [
                    'code' => $invitation->code,
                    'email' => $invitation->email,
                    'role' => $invitation->role->value,
                    'role_label' => $invitation->role->label(),
                    'created_at' => $invitation->created_at->toISOString(),
                ]),
            // Permissions of the currently logged-in user on this team (canDelete, canUpdate, etc.)
            'permissions' => $user->toTeamPermissions($team),
            // Selectable roles for invitation modal
            'availableRoles' => TeamRole::assignable(),
        ]);
    }

    /**
     * Update the specified team name.
     *
     * @param  SaveTeamRequest  $request  Form request validating the updated name.
     * @param  Team  $team  Team model to update.
     * @return RedirectResponse Redirect back to the edit view.
     */
    public function update(SaveTeamRequest $request, Team $team): RedirectResponse
    {
        // Check authorization policy: user must have permission to update this team
        Gate::authorize('update', $team);

        // Execute in a database transaction with pessimistic locking to prevent race conditions
        $team = DB::transaction(function () use ($request, $team) {
            $team = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();

            $team->update(['name' => $request->validated('name')]);

            return $team;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team updated.')]);

        return to_route('teams.edit', ['team' => $team->slug]);
    }

    /**
     * Switch the user's active team context.
     *
     * @param  Request  $request  Incoming HTTP request.
     * @param  Team  $team  The team to switch to.
     * @return RedirectResponse Redirect back to previous page in new team context.
     */
    public function switch(Request $request, Team $team): RedirectResponse
    {
        // 403 Forbidden if user doesn't belong to this team
        abort_unless($request->user()->belongsToTeam($team), 403);

        // Updates user's current_team_id in database and session
        $request->user()->switchTeam($team);

        return back();
    }

    /**
     * Leave the specified team.
     *
     * @param  Request  $request  Incoming HTTP request.
     * @param  Team  $team  The team to leave.
     * @return RedirectResponse Redirects to teams list.
     */
    public function leave(Request $request, Team $team): RedirectResponse
    {
        Gate::authorize('leave', $team);

        $user = $request->user();

        // If the user is currently operating in this team, determine fallback team
        $fallbackTeam = $user->isCurrentTeam($team)
            ? $user->fallbackTeam($team)
            : null;

        // Delete pivot record from team_user / memberships table
        $team->memberships()
            ->where('user_id', $user->id)
            ->delete();

        if ($fallbackTeam) {
            $user->switchTeam($fallbackTeam);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('You left the team ":name"', ['name' => $team->name])]);

        return to_route('teams.index');
    }

    /**
     * Delete the specified team and clean up all associated records.
     *
     * @param  DeleteTeamRequest  $request  Form request validating delete authority and safeguards.
     * @param  Team  $team  The team to delete.
     * @return RedirectResponse Redirects to teams list.
     */
    public function destroy(DeleteTeamRequest $request, Team $team): RedirectResponse
    {
        $user = $request->user();
        $fallbackTeam = $user->isCurrentTeam($team)
            ? $user->fallbackTeam($team)
            : null;

        // Atomic transaction: clean up member pointers, invitations, memberships, and team record
        DB::transaction(function () use ($user, $team) {
            // Revert any other active users whose current_team was this team back to their personal team
            User::where('current_team_id', $team->id)
                ->where('id', '!=', $user->id)
                ->each(fn (User $affectedUser) => $affectedUser->switchTeam($affectedUser->personalTeam()));

            $team->invitations()->delete();
            $team->memberships()->delete();
            $team->delete();
        });

        if ($fallbackTeam) {
            $user->switchTeam($fallbackTeam);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team deleted.')]);

        return to_route('teams.index');
    }
}
