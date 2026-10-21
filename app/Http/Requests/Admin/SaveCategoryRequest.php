<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use App\Rules\ImageUrl;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SaveCategoryRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:120', 'alpha_dash', Rule::unique('categories', 'slug')->ignore($this->route('category'))],
            'description' => ['nullable', 'string', 'max:1000'],
            'image' => ['nullable', 'string', 'max:2048', new ImageUrl],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'sort_order' => ['integer', 'min:0', 'max:100000'],
        ];
    }

    /**
     * Derive the slug from the name when it is left blank.
     */
    protected function prepareForValidation(): void
    {
        /** @var Category|null $category */
        $category = $this->route('category');
        $base = Str::slug($this->filled('slug') ? $this->string('slug') : $this->string('name')) ?: 'category';

        if ($this->filled('slug')) {
            $this->merge(['slug' => $base]);

            return;
        }

        $slug = $base;

        for ($suffix = 2; Category::query()->where('slug', $slug)->whereKeyNot($category?->id)->exists(); $suffix++) {
            $slug = "{$base}-{$suffix}";
        }

        $this->merge(['slug' => $slug]);
    }
}
