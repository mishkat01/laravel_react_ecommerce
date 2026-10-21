<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Services\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Applies and removes the cart's discount code.
 */
class CartCouponController extends Controller
{
    /**
     * Apply a coupon code to the cart.
     *
     * @throws ValidationException
     */
    public function store(Request $request, Cart $cart): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        $coupon = Coupon::findByCode($validated['code']);
        $subtotal = (float) $cart->items()->sum('line_total');
        $reason = $coupon === null ? __('This coupon code is invalid.') : $coupon->unavailableReason($subtotal);

        if ($reason !== null) {
            throw ValidationException::withMessages(['code' => $reason]);
        }

        $cart->applyCoupon($coupon);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Coupon :code applied.', ['code' => $coupon->code])]);

        return back();
    }

    /**
     * Remove the applied coupon.
     */
    public function destroy(Cart $cart): RedirectResponse
    {
        $cart->removeCoupon();

        return back();
    }
}
