<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $price = fake()->randomFloat(2, 10, 300);
        $quantity = fake()->numberBetween(1, 3);

        return [
            'order_id' => Order::factory(),
            'product_id' => null,
            'product_name' => fake()->words(3, true),
            'product_image' => null,
            'sku' => null,
            'color' => null,
            'unit_price' => $price,
            'quantity' => $quantity,
            'line_total' => round($price * $quantity, 2),
        ];
    }

    /**
     * Snapshot an existing product onto the line.
     */
    public function forProduct(Product $product, int $quantity = 1): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_image' => $product->primaryImage(),
            'sku' => $product->sku,
            'unit_price' => $product->price,
            'quantity' => $quantity,
            'line_total' => round((float) $product->price * $quantity, 2),
        ]);
    }
}
