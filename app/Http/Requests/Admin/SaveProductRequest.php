<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use App\Rules\ImageUrl;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SaveProductRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Product|null $product */
        $product = $this->route('product');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('products', 'slug')->ignore($product)],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'subcategory_id' => [
                'nullable',
                'integer',
                Rule::exists('subcategories', 'id')->where('category_id', $this->integer('category_id')),
            ],
            'brand' => ['nullable', 'string', 'max:120'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'compare_price' => ['nullable', 'numeric', 'gt:price', 'max:99999999'],
            'sku' => ['nullable', 'string', 'max:64', Rule::unique('products', 'sku')->ignore($product)],
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:1000000'],
            'images' => ['array', 'max:8'],
            'images.*' => ['required', 'string', 'max:2048', new ImageUrl],
            'colors' => ['array', 'max:12'],
            'colors.*.name' => ['required', 'string', 'max:50', 'distinct'],
            'colors.*.hex' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'features' => ['array', 'max:12'],
            'features.*' => ['required', 'string', 'max:200'],
            'badge' => ['nullable', 'string', 'max:30'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'sort_order' => ['integer', 'min:0', 'max:100000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'subcategory_id.exists' => __('The subcategory must belong to the selected category.'),
            'compare_price.gt' => __('The compare-at price must be higher than the price.'),
            'colors.*.hex.regex' => __('Each color needs a hex value such as #1C1917.'),
        ];
    }

    /**
     * Generate a unique slug from the name when none is given, and default the list fields.
     */
    protected function prepareForValidation(): void
    {
        /** @var Product|null $product */
        $product = $this->route('product');

        $this->merge([
            'slug' => $this->filled('slug')
                ? Str::slug($this->string('slug'))
                : $this->uniqueSlug(Str::slug($this->string('name')) ?: 'product', $product?->id),
            'images' => $this->input('images', []),
            'colors' => $this->input('colors', []),
            'features' => array_values(array_filter((array) $this->input('features', []), fn ($feature) => filled($feature))),
        ]);
    }

    /**
     * Append a numeric suffix until the slug is unused.
     */
    private function uniqueSlug(string $base, ?int $ignoreId): string
    {
        $slug = $base;

        for ($suffix = 2; Product::query()->where('slug', $slug)->whereKeyNot($ignoreId)->exists(); $suffix++) {
            $slug = "{$base}-{$suffix}";
        }

        return $slug;
    }
}
