<?php

namespace Database\Factories;

use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = Str::title(fake()->unique()->words(2, true));

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'content' => "## {$title}\n\n".fake()->paragraph(),
            'is_published' => true,
        ];
    }

    /**
     * Indicate that the page is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => ['is_published' => false]);
    }
}
