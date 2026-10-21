<?php

namespace App\Actions\Checkout;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Notifications\OrderPlaced;
use App\Services\Cart;
use App\Services\StorefrontSettings;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * PlaceOrder Action
 *
 * Converts the customer's cart into an order inside a single transaction:
 * 1. Locks the purchased product rows so concurrent checkouts cannot oversell stock.
 * 2. Re-prices every line from the database and re-validates the coupon.
 * 3. Snapshots the customer, address, and line items onto the order.
 * 4. Decrements stock, increments sales counts and coupon usage.
 * The cart is emptied and a confirmation is sent only after the transaction commits.
 */
class PlaceOrder
{
    public function __construct(private Cart $cart, private StorefrontSettings $settings) {}

    /**
     * Place an order for the user's current cart.
     *
     * @param  array{customer_name: string, customer_email: string, customer_phone: string|null, line1: string, line2: string|null, city: string, state: string|null, postal_code: string, country: string, payment_method: string, notes: string|null}  $details
     *
     * @throws ValidationException
     */
    public function handle(User $user, array $details): Order
    {
        $lines = $this->cart->lines();

        if ($lines === []) {
            throw ValidationException::withMessages(['cart' => __('Your cart is empty.')]);
        }

        $order = DB::transaction(function () use ($user, $details, $lines) {
            $products = Product::query()
                ->active()
                ->whereIn('id', array_column($lines, 'product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $this->ensureLinesArePurchasable($lines, $products->all());

            $subtotal = collect($lines)->sum(
                fn (array $line) => (float) $products[$line['product_id']]->price * $line['quantity'],
            );

            $coupon = $this->redeemableCoupon($subtotal);
            $totals = $this->cart->totals($subtotal, $coupon);

            $order = Order::create([
                'number' => Order::generateNumber(),
                'user_id' => $user->id,
                'status' => OrderStatus::Pending,
                'payment_method' => PaymentMethod::from($details['payment_method']),
                'payment_status' => PaymentStatus::Unpaid,
                'coupon_code' => $coupon?->code,
                'subtotal' => $totals['subtotal'],
                'discount_total' => $totals['discount'],
                'shipping_total' => $totals['shipping'],
                'total' => $totals['total'],
                'currency' => $this->settings->section('store')['currency'],
                'customer_name' => $details['customer_name'],
                'customer_email' => $details['customer_email'],
                'customer_phone' => $details['customer_phone'] ?? null,
                'shipping_address' => [
                    'line1' => $details['line1'],
                    'line2' => $details['line2'] ?? null,
                    'city' => $details['city'],
                    'state' => $details['state'] ?? null,
                    'postal_code' => $details['postal_code'],
                    'country' => $details['country'],
                ],
                'notes' => $details['notes'] ?? null,
            ]);

            $order->items()->createMany(collect($lines)->map(function (array $line) use ($products) {
                $product = $products[$line['product_id']];

                return [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_image' => $product->primaryImage(),
                    'sku' => $product->sku,
                    'color' => $line['color'],
                    'unit_price' => $product->price,
                    'quantity' => $line['quantity'],
                    'line_total' => round((float) $product->price * $line['quantity'], 2),
                ];
            })->values()->all());

            foreach (collect($lines)->groupBy('product_id') as $productId => $productLines) {
                $quantity = $productLines->sum('quantity');

                $products[$productId]->decrement('stock_quantity', $quantity);
                $products[$productId]->increment('sales_count', $quantity);
            }

            $coupon?->increment('used_count');

            return $order;
        });

        $this->cart->clear();

        $user->notify(new OrderPlaced($order));

        return $order;
    }

    /**
     * Ensure every line refers to a purchasable product with enough stock.
     *
     * @param  array<string, array{product_id: int, quantity: int, color: string|null}>  $lines
     * @param  array<int, Product>  $products
     *
     * @throws ValidationException
     */
    private function ensureLinesArePurchasable(array $lines, array $products): void
    {
        foreach (collect($lines)->groupBy('product_id') as $productId => $productLines) {
            $product = $products[$productId] ?? null;

            if ($product === null) {
                throw ValidationException::withMessages([
                    'cart' => __('An item in your cart is no longer available. Please review your cart.'),
                ]);
            }

            if ($productLines->sum('quantity') > $product->stock_quantity) {
                throw ValidationException::withMessages([
                    'cart' => $product->stock_quantity > 0
                        ? __('Only :count of ":name" left in stock.', ['count' => $product->stock_quantity, 'name' => $product->name])
                        : __('":name" is sold out.', ['name' => $product->name]),
                ]);
            }
        }
    }

    /**
     * Lock and re-validate the applied coupon.
     *
     * @throws ValidationException
     */
    private function redeemableCoupon(float $subtotal): ?Coupon
    {
        $code = $this->cart->couponCode();

        if ($code === null) {
            return null;
        }

        $coupon = Coupon::query()->where('code', $code)->lockForUpdate()->first();
        $reason = $coupon === null ? __('This coupon no longer exists.') : $coupon->unavailableReason($subtotal);

        if ($reason !== null) {
            throw ValidationException::withMessages(['coupon' => $reason]);
        }

        return $coupon;
    }
}
