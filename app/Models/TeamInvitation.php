<?php

namespace App\Models;

use App\Enums\TeamRole;
use Database\Factories\TeamInvitationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Class TeamInvitation
 *
 * Represents a pending, accepted, or expired invitation for an external user to join a team workspace.
 * Demonstrates:
 * 1. Eloquent Lifecycle Hook (`boot` -> `creating`): Auto-generating secure random tokens (`code`).
 * 2. Implicit Route Model Binding Override: `getRouteKeyName()` returning `'code'` so routes like
 *    `/invitations/{invitation}` automatically resolve records by their 64-character secret token.
 * 3. Temporal State Predicates: `isPending()`, `isExpired()`, and `isAccepted()`.
 *
 * @property int $id
 * @property string $code
 * @property int $team_id
 * @property string $email
 * @property TeamRole $role
 * @property int $invited_by
 * @property Carbon|null $expires_at
 * @property Carbon|null $accepted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Team $team
 * @property-read User $inviter
 */
#[Fillable(['team_id', 'email', 'role', 'invited_by', 'expires_at', 'accepted_at'])]
class TeamInvitation extends Model
{
    /** @use HasFactory<TeamInvitationFactory> */
    use HasFactory;

    /**
     * Bootstrap the model and its event listeners.
     * Automatically generates a cryptographically random 64-character invite token
     * upon record creation if one was not manually supplied.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (TeamInvitation $invitation) {
            if (empty($invitation->code)) {
                $invitation->code = Str::random(64);
            }
        });
    }

    /**
     * The team workspace that the invitation belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * The existing team member who generated and sent the invitation.
     *
     * @return BelongsTo<User, $this>
     */
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    /**
     * Determine if the invitation has been accepted by a recipient.
     */
    public function isAccepted(): bool
    {
        return $this->accepted_at !== null;
    }

    /**
     * Determine if the invitation is currently pending action (neither accepted nor expired).
     */
    public function isPending(): bool
    {
        return $this->accepted_at === null && ! $this->isExpired();
    }

    /**
     * Determine if the invitation has exceeded its expiration date.
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Attribute casting definitions.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => TeamRole::class,
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }

    /**
     * Get the route key for implicit route model binding.
     *
     * By returning 'code', Laravel will query `WHERE code = ?` instead of `WHERE id = ?`
     * when resolving `{invitation}` parameters in routes and controllers.
     * This prevents predictable sequential ID guessing and ensures invite links are secure.
     */
    public function getRouteKeyName(): string
    {
        return 'code';
    }
}

