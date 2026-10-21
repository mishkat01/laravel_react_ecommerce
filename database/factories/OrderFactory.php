<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 20, 600);

        return [
            'number' => 'ORD-'.now()->format('ymd').'-'.Str::upper(Str::random(6)),
            'user_id' => User::factory(),
            'status' => OrderStatus::Pending,
            'payment_method' => PaymentMethod::CashOnDelivery,
            'payment_status' => PaymentStatus::Unpaid,
            'coupon_code' => null,
            'subtotal' => $subtotal,
            'discount_total' => 0,
            'shipping_total' => 0,
            'total' => $subtotal,
            'currency' => 'USD',
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'shipping_address' => [
                'line1' => fake()->streetAddress(),
                'line2' => null,
                'city' => fake()->city(),
                'state' => null,
                'postal_code' => fake()->postcode(),
                'country' => fake()->country(),
            ],
            'notes' => null,
        ];
    }

    /**
     * Set the order status.
     */
    public function status(OrderStatus $status): static
    {
        return $this->state(fn (array $attributes) => ['status' => $status]);
    }
}
