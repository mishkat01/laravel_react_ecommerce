<?php

namespace App\Actions\Teams;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * CreateTeam Action
 *
 * Encapsulates the domain logic for team creation:
 * 1. Creates the Team record.
 * 2. Assigns the creator as the Owner via the Membership pivot table.
 * 3. Switches the user's active session context to the newly created team.
 * All wrapped inside a DB transaction for database consistency.
 */
class CreateTeam
{
    /**
     * Create a new team and add the user as owner.
     *
     * @param  User  $user  The user creating and owning the team.
     * @param  string  $name  The user-defined name of the team.
     * @param  bool  $isPersonal  Whether this team is the user's personal default workspace.
     * @return Team The newly created Team model.
     */
    public function handle(User $user, string $name, bool $isPersonal = false): Team
    {
        return DB::transaction(function () use ($user, $name, $isPersonal) {
            // 1. Create team model (slug is generated automatically in Team::boot)
            $team = Team::create([
                'name' => $name,
                'is_personal' => $isPersonal,
            ]);

            // 2. Attach creator as Owner in membership pivot table
            $team->memberships()->create([
                'user_id' => $user->id,
                'role' => TeamRole::Owner,
            ]);

            // 3. Immediately set as user's active current team
            $user->switchTeam($team);

            return $team;
        });
    }
}
