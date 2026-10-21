<?php

namespace App\Http\Requests\Admin;

use App\Enums\CouponType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SaveCouponRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('coupons', 'code')->ignore($this->route('coupon'))],
            'type' => ['required', Rule::enum(CouponType::class)],
            'value' => [
                'required',
                'numeric',
                'gt:0',
                Rule::when($this->input('type') === CouponType::Percent->value, ['max:100'], ['max:99999999']),
            ],
            'min_subtotal' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', Rule::when($this->filled('starts_at'), ['after_or_equal:starts_at'])],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Normalize the code to upper-case before checking uniqueness.
     */
    protected function prepareForValidation(): void
    {
        $this->merge(['code' => Str::upper(trim((string) $this->input('code')))]);
    }
}
