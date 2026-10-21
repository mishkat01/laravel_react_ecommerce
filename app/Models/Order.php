<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Order Model
 *
 * A placed order. Customer, address, and line item details are snapshotted at checkout
 * so later catalog edits never change what the customer bought.
 *
 * @property int $id
 * @property string $number
 * @property int|null $user_id
 * @property OrderStatus $status
 * @property PaymentMethod $payment_method
 * @property PaymentStatus $payment_status
 * @property string|null $coupon_code
 * @property string $subtotal
 * @property string $discount_total
 * @property string $shipping_total
 * @property string $total
 * @property string $currency
 * @property string $customer_name
 * @property string $customer_email
 * @property string|null $customer_phone
 * @property array{line1: string, line2: string|null, city: string, state: string|null, postal_code: string, country: string} $shipping_address
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $user
 * @property-read Collection<int, OrderItem> $items
 */
#[Fillable([
    'number',
    'user_id',
    'status',
    'payment_method',
    'payment_status',
    'coupon_code',
    'subtotal',
    'discount_total',
    'shipping_total',
    'total',
    'currency',
    'customer_name',
    'customer_email',
    'customer_phone',
    'shipping_address',
    'notes',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    /**
     * The customer who placed the order.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The purchased line items.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Generate a unique, human-friendly order number such as `ORD-261021-8KQ2ZD`.
     */
    public static function generateNumber(): string
    {
        do {
            $number = 'ORD-'.now()->format('ymd').'-'.Str::upper(Str::random(6));
        } while (static::query()->where('number', $number)->exists());

        return $number;
    }

    /**
     * Get the attributes that should be cast to native types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_method' => PaymentMethod::class,
            'payment_status' => PaymentStatus::class,
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'shipping_total' => 'decimal:2',
            'total' => 'decimal:2',
            'shipping_address' => 'array',
        ];
    }

    /**
     * Resolve orders by their public order number in route model binding.
     */
    public function getRouteKeyName(): string
    {
        return 'number';
    }
}
