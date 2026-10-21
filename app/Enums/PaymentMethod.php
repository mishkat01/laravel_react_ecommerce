<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CashOnDelivery = 'cash_on_delivery';
    case BankTransfer = 'bank_transfer';

    /**
     * Get the display label for the payment method.
     */
    public function label(): string
    {
        return match ($this) {
            self::CashOnDelivery => 'Cash on delivery',
            self::BankTransfer => 'Bank transfer',
        };
    }

    /**
     * Get the customer-facing description for the payment method.
     */
    public function description(): string
    {
        return match ($this) {
            self::CashOnDelivery => 'Pay with cash when your order arrives.',
            self::BankTransfer => 'Transfer the total after placing your order. Bank details are emailed to you.',
        };
    }

    /**
     * Get every payment method as a checkout option.
     *
     * @return array<int, array{value: string, label: string, description: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $method) => [
                'value' => $method->value,
                'label' => $method->label(),
                'description' => $method->description(),
            ],
            self::cases(),
        );
    }
}
