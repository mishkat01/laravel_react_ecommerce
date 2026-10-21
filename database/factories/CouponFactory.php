<?php

namespace Database\Factories;

use App\Enums\CouponType;
use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => Str::upper(Str::random(8)),
            'type' => CouponType::Percent,
            'value' => 10,
            'min_subtotal' => null,
            'max_uses' => null,
            'starts_at' => null,
            'expires_at' => null,
            'is_active' => true,
        ];
    }

    /**
     * Take a fixed amount off instead of a percentage.
     */
    public function fixed(float $amount): static
    {
        return $this->state(fn (array $attributes) => ['type' => CouponType::Fixed, 'value' => $amount]);
    }

    /**
     * Indicate that the coupon has expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => ['expires_at' => now()->subDay()]);
    }

    /**
     * Indicate that the coupon has been disabled by an admin.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }
}
