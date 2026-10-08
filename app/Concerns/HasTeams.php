<?php

namespace App\Concerns;

use App\Data\TeamPermissions;
use App\Data\UserTeam;
use App\Enums\TeamPermission;
use App\Enums\TeamRole;
use App\Models\Membership;
use App\Models\Team;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\URL;

/**
 * Trait HasTeams
 *
 * Implements full multi-tenancy capabilities on the Eloquent User model:
 * - Many-to-many team memberships with custom pivot (`team_members`) and enum roles.
 * - Active workspace tracking (`current_team_id`) and automatic URL default parameter binding.
 * - Data Transfer Object (DTO) generation (`UserTeam`, `TeamPermissions`) for clean serialization
 *   over Inertia.js props to React.
 */
trait HasTeams
{
    /**
     * Get all of the teams the user belongs to.
     * Includes the `role` enum column from the `team_members` pivot table.
     *
     * @return BelongsToMany<Team, $this>
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_members', 'user_id', 'team_id')
            ->withPivot(['role'])
            ->withTimestamps();
    }

    /**
     * Get all of the teams the user owns.
     * Navigates through the `Membership` pivot model and filters by `TeamRole::Owner`.
     *
     * @return HasManyThrough<Team, Membership, $this>
     */
    public function ownedTeams(): HasManyThrough
    {
        return $this->hasManyThrough(
            Team::class,
            Membership::class,
            'user_id',
            'id',
            'id',
            'team_id',
        )->where('team_members.role', TeamRole::Owner->value);
    }

    /**
     * Get all of the direct membership pivot records for the user.
     *
     * @return HasMany<Membership, $this>
     */
    public function teamMemberships(): HasMany
    {
        return $this->hasMany(Membership::class, 'user_id');
    }

    /**
     * Get the user's currently active team workspace.
     *
     * @return BelongsTo<Team, $this>
     */
    public function currentTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'current_team_id');
    }

    /**
     * Get the user's default personal team workspace created upon registration.
     */
    public function personalTeam(): ?Team
    {
        return $this->ownedTeams()
            ->where('teams.is_personal', true)
            ->first();
    }

    /**
     * Switch the user's active workspace to the given team.
     *
     * Crucial Laravel + Inertia concept:
     * `URL::defaults(['current_team' => $team->slug])` configures Laravel's URL generator
     * so all subsequent named routes with `{current_team}` parameters (e.g., `route('dashboard')`)
     * automatically fill in this team's slug without having to pass it manually every time.
     *
     * @param  Team  $team  The target workspace to switch into.
     * @return bool True if successfully switched, false if user is not a member.
     */
    public function switchTeam(Team $team): bool
    {
        // Guard against unauthorized switching
        if (! $this->belongsToTeam($team)) {
            return false;
        }

        // Persist the active workspace on the user record
        $this->update(['current_team_id' => $team->id]);
        $this->setRelation('currentTeam', $team);

        // Pre-populate route generator with the active slug
        URL::defaults(['current_team' => $team->slug]);

        return true;
    }

    /**
     * Determine if the user belongs to the given team.
     */
    public function belongsToTeam(Team $team): bool
    {
        return $this->teams()->where('teams.id', $team->id)->exists();
    }

    /**
     * Determine if the given team is currently active for the user.
     */
    public function isCurrentTeam(Team $team): bool
    {
        return $this->current_team_id === $team->id;
    }

    /**
     * Determine if the user has the Owner role on the given team.
     */
    public function ownsTeam(Team $team): bool
    {
        return $this->teamRole($team) === TeamRole::Owner;
    }

    /**
     * Retrieve the user's assigned role enum for a specific team.
     */
    public function teamRole(Team $team): ?TeamRole
    {
        return $this->teamMemberships()
            ->where('team_id', $team->id)
            ->first()
            ?->role;
    }

    /**
     * Transform the user's teams into a collection of serialized UserTeam DTOs.
     * These DTOs are sent to React via HandleInertiaRequests middleware for the team switcher.
     *
     * @param  bool  $includeCurrent  Whether to include the active team in the returned list.
     * @return Collection<int, UserTeam>
     */
    public function toUserTeams(bool $includeCurrent = false): Collection
    {
        return $this->teams()
            ->get()
            ->map(fn (Team $team) => ! $includeCurrent && $this->isCurrentTeam($team) ? null : $this->toUserTeam($team))
            ->filter()
            ->values();
    }

    /**
     * Transform an Eloquent Team model into a UserTeam DTO for frontend consumption.
     */
    public function toUserTeam(Team $team): UserTeam
    {
        $role = $this->teamRole($team);

        return new UserTeam(
            id: $team->id,
            name: $team->name,
            slug: $team->slug,
            isPersonal: $team->is_personal,
            role: $role?->value,
            roleLabel: $role?->label(),
            isCurrent: $this->isCurrentTeam($team),
        );
    }

    /**
     * Calculate granular permission flags for the user on a specific team.
     * Returns a TeamPermissions DTO rendered by React to enable/disable UI buttons.
     */
    public function toTeamPermissions(Team $team): TeamPermissions
    {
        $role = $this->teamRole($team);

        return new TeamPermissions(
            canUpdateTeam: $role?->hasPermission(TeamPermission::UpdateTeam) ?? false,
            canDeleteTeam: $role?->hasPermission(TeamPermission::DeleteTeam) ?? false,
            canAddMember: $role?->hasPermission(TeamPermission::AddMember) ?? false,
            canUpdateMember: $role?->hasPermission(TeamPermission::UpdateMember) ?? false,
            canRemoveMember: $role?->hasPermission(TeamPermission::RemoveMember) ?? false,
            canCreateInvitation: $role?->hasPermission(TeamPermission::CreateInvitation) ?? false,
            canCancelInvitation: $role?->hasPermission(TeamPermission::CancelInvitation) ?? false,
        );
    }

    /**
     * Find a fallback team to switch the user to when their current team is deleted or left.
     */
    public function fallbackTeam(?Team $excluding = null): ?Team
    {
        return $this->teams()
            ->when($excluding, fn ($query) => $query->where('teams.id', '!=', $excluding->id))
            ->orderByRaw('LOWER(teams.name)')
            ->first();
    }

    /**
     * Determine if the user has a specific permission enum on the team.
     */
    public function hasTeamPermission(Team $team, TeamPermission $permission): bool
    {
        return $this->teamRole($team)?->hasPermission($permission) ?? false;
    }
}

