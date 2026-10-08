<?php

namespace App\Models;

use App\Enums\TeamRole;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Carbon;

/**
 * Class Membership
 *
 * Custom Eloquent Pivot model representing the `team_members` intermediate table.
 * Demonstrates:
 * 1. Extending `Illuminate\Database\Eloquent\Relations\Pivot` to add custom logic,
 *    relationships, and casting to many-to-many associations.
 * 2. PHP 8.1 Backed Enum casting for roles (`TeamRole`).
 * 3. Primary key incrementing configuration on intermediate pivot tables.
 *
 * @property int $id
 * @property int $team_id
 * @property int $user_id
 * @property TeamRole $role
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Team $team
 * @property-read User $user
 */
#[Fillable(['team_id', 'user_id', 'role'])]
class Membership extends Pivot
{
    /**
     * Explicit table name for the pivot model.
     *
     * @var string
     */
    protected $table = 'team_members';

    /**
     * Indicates if the pivot IDs are auto-incrementing integers.
     * By default, Laravel Pivot models assume composite keys; setting this to true
     * enables an individual auto-incrementing `id` primary key column.
     *
     * @var bool
     */
    public $incrementing = true;

    /**
     * The team workspace this membership record belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * The user account associated with this membership.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Attribute casting definitions.
     * Automatically casts string database values (e.g., 'owner', 'member', 'admin')
     * into strongly-typed `TeamRole` PHP enum instances.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => TeamRole::class,
        ];
    }
}

