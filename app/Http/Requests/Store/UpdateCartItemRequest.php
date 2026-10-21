<?php

namespace App\Http\Requests\Store;

use App\Models\Product;
use App\Services\Cart;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateCartItemRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }

    /**
     * Ensure the new quantity fits the remaining stock.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $cart = app(Cart::class);
                $key = (string) $this->route('line');
                $line = $cart->line($key);

                if ($validator->errors()->isNotEmpty() || $line === null) {
                    return;
                }

                $stock = (int) Product::query()->whereKey($line['product_id'])->value('stock_quantity');
                $available = $stock - $cart->quantityOf($line['product_id'], exceptKey: $key);

                if ($this->integer('quantity') > $available) {
                    $validator->errors()->add('quantity', __('Only :count available.', ['count' => max($available, 0)]));
                }
            },
        ];
    }
}
