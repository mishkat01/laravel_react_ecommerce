<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    /**
     * Get the display label for the status.
     */
    public function label(): string
    {
        return ucfirst($this->value);
    }

    /**
     * Determine if the order still holds reserved stock.
     */
    public function holdsStock(): bool
    {
        return $this !== self::Cancelled;
    }

    /**
     * Get every status as a select option.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $status) => ['value' => $status->value, 'label' => $status->label()],
            self::cases(),
        );
    }
}
