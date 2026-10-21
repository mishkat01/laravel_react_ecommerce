<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SavePageRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('pages', 'slug')->ignore($this->route('page'))],
            'content' => ['required', 'string', 'max:100000'],
            'is_published' => ['boolean'],
        ];
    }

    /**
     * Derive the slug from the title when it is left blank.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->filled('slug') ? $this->string('slug') : $this->string('title')),
        ]);
    }
}
