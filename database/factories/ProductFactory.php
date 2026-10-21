<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->words(3, true));

        return [
            'category_id' => Category::factory(),
            'subcategory_id' => null,
            'name' => $name,
            'slug' => Str::slug($name),
            'brand' => fake()->company(),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 10, 500),
            'compare_price' => null,
            'sku' => Str::upper(Str::random(10)),
            'stock_quantity' => 50,
            'images' => ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'],
            'colors' => null,
            'features' => [],
            'badge' => null,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 0,
        ];
    }

    /**
     * Place the product in a subcategory (and its parent category).
     */
    public function forSubcategory(Subcategory $subcategory): static
    {
        return $this->state(fn (array $attributes) => [
            'category_id' => $subcategory->category_id,
            'subcategory_id' => $subcategory->id,
        ]);
    }

    /**
     * Indicate that the product is unpublished.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }

    /**
     * Indicate that the product is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => ['is_featured' => true]);
    }

    /**
     * Discount the product below a compare-at price.
     */
    public function onSale(): static
    {
        return $this->state(fn (array $attributes) => [
            'compare_price' => round((float) $attributes['price'] * 1.25, 2),
        ]);
    }

    /**
     * Indicate that no units are available.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => ['stock_quantity' => 0]);
    }

    /**
     * Give the product color variants.
     */
    public function withColors(): static
    {
        return $this->state(fn (array $attributes) => [
            'colors' => [
                ['name' => 'Matte Black', 'hex' => '#1C1917'],
                ['name' => 'Silver', 'hex' => '#D6D3D1'],
            ],
        ]);
    }
}
