<?php

namespace App\Enums;

enum CouponType: string
{
    case Percent = 'percent';
    case Fixed = 'fixed';

    /**
     * Get the display label for the coupon type.
     */
    public function label(): string
    {
        return match ($this) {
            self::Percent => 'Percentage',
            self::Fixed => 'Fixed amount',
        };
    }
}
