<?php

namespace App\Http\Requests\Store;

use App\Models\Product;
use App\Services\Cart;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AddToCartRequest extends FormRequest
{
    /**
     * The purchasable product being added, resolved during validation.
     */
    private ?Product $product = null;

    /**
     * The chosen color, defaulting to the product's first variant.
     */
    private ?string $color = null;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer'],
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'color' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * Check availability, variant, and stock once the basic rules pass.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $product = Product::query()->active()->find($this->integer('product_id'));

                if ($product === null) {
                    $validator->errors()->add('product_id', __('This product is no longer available.'));

                    return;
                }

                $color = $this->filled('color') ? $this->string('color')->toString() : ($product->colors[0]['name'] ?? null);

                if (! $product->hasColor($color)) {
                    $validator->errors()->add('color', __('Please choose an available color.'));

                    return;
                }

                $available = $product->stock_quantity - app(Cart::class)->quantityOf($product->id);

                if ($this->integer('quantity') > $available) {
                    $validator->errors()->add('quantity', $available > 0
                        ? __('Only :count more can be added to your cart.', ['count' => $available])
                        : __('No more stock is available for this product.'));

                    return;
                }

                $this->product = $product;
                $this->color = $color;
            },
        ];
    }

    /**
     * The validated product.
     */
    public function product(): Product
    {
        return $this->product;
    }

    /**
     * The validated color.
     */
    public function color(): ?string
    {
        return $this->color;
    }
}
