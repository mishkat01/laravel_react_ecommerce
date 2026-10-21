<?php

namespace App\Http\Controllers\Store;

use App\Actions\Checkout\PlaceOrder;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Store\PlaceOrderRequest;
use App\Services\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Checkout for signed-in customers. Guests are sent to log in or register by the `auth`
 * middleware and return here afterwards through Laravel's intended-URL redirect.
 */
class CheckoutController extends Controller
{
    /**
     * Show the checkout form.
     */
    public function create(Request $request, Cart $cart): Response|RedirectResponse
    {
        if ($cart->items()->isEmpty()) {
            Inertia::flash('toast', ['type' => 'info', 'message' => __('Your cart is empty.')]);

            return to_route('shop.index');
        }

        $user = $request->user();
        $lastOrder = $user->orders()->latest()->first();

        return Inertia::render('store/checkout', [
            'paymentMethods' => PaymentMethod::options(),
            'defaults' => [
                'customer_name' => $lastOrder?->customer_name ?? $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $lastOrder?->customer_phone ?? '',
                'line1' => $lastOrder?->shipping_address['line1'] ?? '',
                'line2' => $lastOrder?->shipping_address['line2'] ?? '',
                'city' => $lastOrder?->shipping_address['city'] ?? '',
                'state' => $lastOrder?->shipping_address['state'] ?? '',
                'postal_code' => $lastOrder?->shipping_address['postal_code'] ?? '',
                'country' => $lastOrder?->shipping_address['country'] ?? '',
                'payment_method' => PaymentMethod::CashOnDelivery->value,
            ],
        ]);
    }

    /**
     * Place the order.
     */
    public function store(PlaceOrderRequest $request, PlaceOrder $placeOrder): RedirectResponse
    {
        $order = $placeOrder->handle($request->user(), $request->validated());

        return to_route('account.orders.show', $order)->with('order_placed', true);
    }
}
