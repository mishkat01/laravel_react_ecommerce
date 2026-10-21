<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Contracts\Session\Session;
use Illuminate\Support\Collection;

/**
 * Cart
 *
 * Session-backed shopping cart. The session only stores product IDs, quantities, colors,
 * and the applied coupon code; prices are always read fresh from the database so the
 * customer never pays a stale price. Guests keep their cart when they log in because
 * Laravel migrates session data on regeneration.
 */
class Cart
{
    private const LINES_KEY = 'cart.lines';

    private const COUPON_KEY = 'cart.coupon';

    /**
     * Products resolved for the current lines, memoized per instance.
     *
     * @var Collection<int, Product>|null
     */
    private ?Collection $products = null;

    public function __construct(private Session $session, private StorefrontSettings $settings) {}

    /**
     * Build the stable key for a product + color line.
     */
    public static function lineKey(int $productId, ?string $color): string
    {
        return substr(sha1($productId.'|'.($color ?? '')), 0, 12);
    }

    /**
     * Get the raw session lines keyed by line key.
     *
     * @return array<string, array{product_id: int, quantity: int, color: string|null}>
     */
    public function lines(): array
    {
        return $this->session->get(self::LINES_KEY, []);
    }

    /**
     * Determine if the cart has no lines.
     */
    public function isEmpty(): bool
    {
        return $this->lines() === [];
    }

    /**
     * Determine if the given line exists.
     */
    public function has(string $key): bool
    {
        return array_key_exists($key, $this->lines());
    }

    /**
     * Get a single line.
     *
     * @return array{product_id: int, quantity: int, color: string|null}|null
     */
    public function line(string $key): ?array
    {
        return $this->lines()[$key] ?? null;
    }

    /**
     * Total quantity of a product across all of its color lines, optionally ignoring one line.
     */
    public function quantityOf(int $productId, ?string $exceptKey = null): int
    {
        return collect($this->lines())
            ->reject(fn (array $line, string $key) => $key === $exceptKey)
            ->where('product_id', $productId)
            ->sum('quantity');
    }

    /**
     * Add units of a product, merging with an existing line of the same color.
     */
    public function add(Product $product, int $quantity, ?string $color): void
    {
        $key = self::lineKey($product->id, $color);
        $lines = $this->lines();

        $lines[$key] = [
            'product_id' => $product->id,
            'quantity' => ($lines[$key]['quantity'] ?? 0) + $quantity,
            'color' => $color,
        ];

        $this->putLines($lines);
    }

    /**
     * Set the quantity of an existing line.
     */
    public function update(string $key, int $quantity): void
    {
        $lines = $this->lines();

        if (! isset($lines[$key])) {
            return;
        }

        $lines[$key]['quantity'] = $quantity;

        $this->putLines($lines);
    }

    /**
     * Remove a line.
     */
    public function remove(string $key): void
    {
        $lines = $this->lines();

        unset($lines[$key]);

        $this->putLines($lines);
    }

    /**
     * Empty the cart and drop the applied coupon.
     */
    public function clear(): void
    {
        $this->session->forget([self::LINES_KEY, self::COUPON_KEY]);
        $this->products = null;
    }

    /**
     * Get the applied coupon code.
     */
    public function couponCode(): ?string
    {
        return $this->session->get(self::COUPON_KEY);
    }

    /**
     * Get the applied coupon model, if it still exists.
     */
    public function coupon(): ?Coupon
    {
        $code = $this->couponCode();

        return $code === null ? null : Coupon::findByCode($code);
    }

    /**
     * Apply a coupon to the cart.
     */
    public function applyCoupon(Coupon $coupon): void
    {
        $this->session->put(self::COUPON_KEY, $coupon->code);
    }

    /**
     * Remove the applied coupon.
     */
    public function removeCoupon(): void
    {
        $this->session->forget(self::COUPON_KEY);
    }

    /**
     * Resolve the lines against purchasable products. Lines whose product is gone or
     * unpublished are dropped from the session.
     *
     * @return Collection<int, array{key: string, product: Product, quantity: int, color: string|null, line_total: float}>
     */
    public function items(): Collection
    {
        $lines = $this->lines();

        $this->products ??= Product::query()
            ->active()
            ->whereIn('id', array_column($lines, 'product_id'))
            ->get()
            ->keyBy('id');

        $available = array_filter($lines, fn (array $line) => $this->products->has($line['product_id']));

        if (count($available) !== count($lines)) {
            $this->putLines($available, keepProducts: true);
        }

        return collect($available)->map(function (array $line, string $key) {
            $product = $this->products->get($line['product_id']);

            return [
                'key' => $key,
                'product' => $product,
                'quantity' => $line['quantity'],
                'color' => $line['color'],
                'line_total' => round((float) $product->price * $line['quantity'], 2),
            ];
        })->values();
    }

    /**
     * Calculate the order totals for a subtotal and an optional coupon.
     *
     * @return array{subtotal: float, discount: float, shipping: float, total: float}
     */
    public function totals(float $subtotal, ?Coupon $coupon): array
    {
        $store = $this->settings->section('store');
        $threshold = (float) ($store['free_shipping_threshold'] ?? 0);

        $discount = $coupon?->unavailableReason($subtotal) === null ? ($coupon?->discountFor($subtotal) ?? 0.0) : 0.0;
        $qualifiesForFreeShipping = $threshold > 0 && $subtotal >= $threshold;
        $shipping = $subtotal > 0 && ! $qualifiesForFreeShipping ? (float) ($store['shipping_fee'] ?? 0) : 0.0;

        return [
            'subtotal' => round($subtotal, 2),
            'discount' => $discount,
            'shipping' => round($shipping, 2),
            'total' => round($subtotal - $discount + $shipping, 2),
        ];
    }

    /**
     * Get the cart payload shared with the storefront.
     *
     * @return array{
     *     items: list<array<string, mixed>>,
     *     count: int,
     *     subtotal: float,
     *     discount: float,
     *     shipping: float,
     *     total: float,
     *     free_shipping_threshold: float,
     *     coupon: array{code: string, type: string, value: float, error: string|null}|null,
     * }
     */
    public function summary(): array
    {
        $items = $this->items();
        $subtotal = (float) $items->sum('line_total');
        $coupon = $this->coupon();
        $totals = $this->totals($subtotal, $coupon);

        return [
            'items' => $items->map(fn (array $item) => [
                'key' => $item['key'],
                'quantity' => $item['quantity'],
                'color' => $item['color'],
                'line_total' => $item['line_total'],
                'product' => [
                    'id' => $item['product']->id,
                    'name' => $item['product']->name,
                    'slug' => $item['product']->slug,
                    'image' => $item['product']->primaryImage(),
                    'price' => (float) $item['product']->price,
                    'compare_price' => $item['product']->isOnSale() ? (float) $item['product']->compare_price : null,
                    'stock_quantity' => $item['product']->stock_quantity,
                ],
            ])->all(),
            'count' => (int) $items->sum('quantity'),
            ...$totals,
            'free_shipping_threshold' => (float) ($this->settings->section('store')['free_shipping_threshold'] ?? 0),
            'coupon' => $coupon === null ? null : [
                'code' => $coupon->code,
                'type' => $coupon->type->value,
                'value' => (float) $coupon->value,
                'error' => $coupon->unavailableReason($subtotal),
            ],
        ];
    }

    /**
     * Write lines back to the session.
     *
     * @param  array<string, array{product_id: int, quantity: int, color: string|null}>  $lines
     */
    private function putLines(array $lines, bool $keepProducts = false): void
    {
        $this->session->put(self::LINES_KEY, $lines);

        if (! $keepProducts) {
            $this->products = null;
        }
    }
}
