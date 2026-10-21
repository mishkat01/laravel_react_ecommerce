<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SaveSubcategoryRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'required',
                'string',
                'max:120',
                'alpha_dash',
                Rule::unique('subcategories', 'slug')
                    ->where('category_id', $this->integer('category_id'))
                    ->ignore($this->route('subcategory')),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
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
            'slug.unique' => __('This category already has a subcategory with that slug.'),
        ];
    }

    /**
     * Derive the slug from the name when it is left blank.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->filled('slug') ? $this->string('slug') : $this->string('name')),
        ]);
    }
}
