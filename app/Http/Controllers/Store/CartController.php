<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\AddToCartRequest;
use App\Http\Requests\Store\UpdateCartItemRequest;
use App\Services\Cart;
use Illuminate\Http\RedirectResponse;

/**
 * Manages the session cart. Every action redirects back so Inertia refreshes the shared `cart` prop.
 */
class CartController extends Controller
{
    /**
     * Add a product to the cart.
     */
    public function store(AddToCartRequest $request, Cart $cart): RedirectResponse
    {
        $cart->add($request->product(), $request->integer('quantity'), $request->color());

        return back();
    }

    /**
     * Change the quantity of a cart line.
     */
    public function update(UpdateCartItemRequest $request, Cart $cart, string $line): RedirectResponse
    {
        abort_unless($cart->has($line), 404);

        $cart->update($line, $request->integer('quantity'));

        return back();
    }

    /**
     * Remove a cart line.
     */
    public function destroy(Cart $cart, string $line): RedirectResponse
    {
        $cart->remove($line);

        return back();
    }

    /**
     * Empty the cart.
     */
    public function clear(Cart $cart): RedirectResponse
    {
        $cart->clear();

        return back();
    }
}
