<?php

namespace App\Models;

use App\Enums\CouponType;
use App\Services\StorefrontSettings;
use Database\Factories\CouponFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Number;
use Illuminate\Support\Str;

/**
 * Coupon Model
 *
 * A discount code redeemable at checkout. Codes are stored upper-case so lookups are
 * case-insensitive for customers.
 *
 * @property int $id
 * @property string $code
 * @property CouponType $type
 * @property string $value
 * @property string|null $min_subtotal
 * @property int|null $max_uses
 * @property int $used_count
 * @property Carbon|null $starts_at
 * @property Carbon|null $expires_at
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['code', 'type', 'value', 'min_subtotal', 'max_uses', 'starts_at', 'expires_at', 'is_active'])]
class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory;

    /**
     * Find a coupon by code, ignoring case and surrounding whitespace.
     */
    public static function findByCode(string $code): ?self
    {
        return static::query()->where('code', Str::upper(trim($code)))->first();
    }

    /**
     * Get the lifecycle status: `active`, `inactive`, `scheduled`, `expired`, or `exhausted`.
     */
    public function status(): string
    {
        return match (true) {
            ! $this->is_active => 'inactive',
            $this->starts_at !== null && $this->starts_at->isFuture() => 'scheduled',
            $this->expires_at !== null && $this->expires_at->isPast() => 'expired',
            $this->max_uses !== null && $this->used_count >= $this->max_uses => 'exhausted',
            default => 'active',
        };
    }

    /**
     * Explain why the coupon cannot be redeemed for the given subtotal, or null when it can.
     */
    public function unavailableReason(float $subtotal): ?string
    {
        $reason = match ($this->status()) {
            'inactive', 'scheduled' => __('This coupon is not active.'),
            'expired' => __('This coupon has expired.'),
            'exhausted' => __('This coupon has reached its usage limit.'),
            default => null,
        };

        if ($reason === null && $this->min_subtotal !== null && $subtotal < (float) $this->min_subtotal) {
            $reason = __('Spend at least :amount to use this coupon.', [
                'amount' => Number::currency((float) $this->min_subtotal, app(StorefrontSettings::class)->section('store')['currency']),
            ]);
        }

        return $reason;
    }

    /**
     * Calculate the discount for the given subtotal, never exceeding the subtotal itself.
     */
    public function discountFor(float $subtotal): float
    {
        $discount = match ($this->type) {
            CouponType::Percent => $subtotal * min((float) $this->value, 100) / 100,
            CouponType::Fixed => (float) $this->value,
        };

        return round(min($discount, $subtotal), 2);
    }

    /**
     * Normalize the code to upper-case.
     *
     * @return Attribute<string, string>
     */
    protected function code(): Attribute
    {
        return Attribute::make(set: fn (string $value) => Str::upper(trim($value)));
    }

    /**
     * Get the attributes that should be cast to native types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => CouponType::class,
            'value' => 'decimal:2',
            'min_subtotal' => 'decimal:2',
            'max_uses' => 'integer',
            'used_count' => 'integer',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
