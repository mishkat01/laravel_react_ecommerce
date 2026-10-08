<?php

namespace App\Http\Middleware;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureTeamMembership Middleware
 *
 * Enforces multi-tenancy security:
 * 1. Resolves the requested team from route parameters (`{current_team}` or `{team}`).
 * 2. Verifies that the authenticated user actually belongs to that team (prevents unauthorized data access).
 * 3. Optionally checks a minimum role requirement (e.g. member vs admin).
 * 4. Automatically syncs the user's active team session to match the URL.
 */
class EnsureTeamMembership
{
    /**
     * Handle an incoming request.
     *
     * @param  Request  $request  The incoming HTTP request.
     * @param  Closure(Request): (Response)  $next  The pipeline next handler.
     * @param  string|null  $minimumRole  Optional role threshold required for this route.
     */
    public function handle(Request $request, Closure $next, ?string $minimumRole = null): Response
    {
        [$user, $team] = [$request->user(), $this->team($request)];

        // Abort with 403 Forbidden if user is unauthenticated, team not found, or user is not a member
        abort_if(! $user || ! $team || ! $user->belongsToTeam($team), 403);

        // Verify role hierarchy if a minimum role was requested
        $this->ensureTeamMemberHasRequiredRole($user, $team, $minimumRole);

        // If the URL has `{current_team}` but the user's active session is on a different team, auto-switch
        if ($request->route('current_team') && ! $user->isCurrentTeam($team)) {
            $user->switchTeam($team);
        }

        return $next($request);
    }

    /**
     * Ensure the given user has at least the given role, if applicable.
     *
     * @param  User  $user  The authenticated user.
     * @param  Team  $team  The team context.
     * @param  string|null  $minimumRole  Minimum required role value (e.g. 'admin').
     */
    protected function ensureTeamMemberHasRequiredRole(User $user, Team $team, ?string $minimumRole): void
    {
        if ($minimumRole === null) {
            return;
        }

        $role = $user->teamRole($team);
        $requiredRole = TeamRole::tryFrom($minimumRole);

        abort_if(
            $requiredRole === null ||
            $role === null ||
            ! $role->isAtLeast($requiredRole),
            403,
        );
    }

    /**
     * Resolve the Team model associated with the request route.
     *
     * Checks both route parameters:
     * - `{current_team}`: slug used in dashboard URLs
     * - `{team}`: model or slug used in settings URLs
     */
    protected function team(Request $request): ?Team
    {
        $team = $request->route('current_team') ?? $request->route('team');

        if (is_string($team)) {
            $team = Team::where('slug', $team)->first();
        }

        return $team;
    }
}
