<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCouponRequest;
use App\Models\Coupon;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Manage discount codes.
 */
class CouponController extends Controller
{
    /**
     * Display the coupon list.
     */
    public function index(): Response
    {
        return Inertia::render('admin/coupons/index', [
            'coupons' => Coupon::query()
                ->latest()
                ->get()
                ->map(fn (Coupon $coupon) => [
                    'id' => $coupon->id,
                    'code' => $coupon->code,
                    'type' => $coupon->type->value,
                    'value' => (float) $coupon->value,
                    'min_subtotal' => $coupon->min_subtotal !== null ? (float) $coupon->min_subtotal : null,
                    'max_uses' => $coupon->max_uses,
                    'used_count' => $coupon->used_count,
                    'starts_at' => $coupon->starts_at?->format('Y-m-d\TH:i'),
                    'expires_at' => $coupon->expires_at?->format('Y-m-d\TH:i'),
                    'is_active' => $coupon->is_active,
                    'status' => $coupon->status(),
                ]),
        ]);
    }

    /**
     * Store a new coupon.
     */
    public function store(SaveCouponRequest $request): RedirectResponse
    {
        $coupon = Coupon::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Coupon :code created.', ['code' => $coupon->code])]);

        return back();
    }

    /**
     * Update a coupon.
     */
    public function update(SaveCouponRequest $request, Coupon $coupon): RedirectResponse
    {
        $coupon->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Coupon :code saved.', ['code' => $coupon->code])]);

        return back();
    }

    /**
     * Delete a coupon. Orders keep the code they were placed with.
     */
    public function destroy(Coupon $coupon): RedirectResponse
    {
        $coupon->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Coupon :code deleted.', ['code' => $coupon->code])]);

        return back();
    }
}
