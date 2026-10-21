<?php

namespace App\Http\Requests\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateOrderRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(OrderStatus::class)],
            'payment_status' => ['required', Rule::enum(PaymentStatus::class)],
        ];
    }

    /**
     * Cancelling returns stock to inventory, so a cancelled order cannot be reopened.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                /** @var Order $order */
                $order = $this->route('order');

                if ($order->status === OrderStatus::Cancelled && $this->input('status') !== OrderStatus::Cancelled->value) {
                    $validator->errors()->add('status', __('Cancelled orders cannot be reopened.'));
                }
            },
        ];
    }
}
