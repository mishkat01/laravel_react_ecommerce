<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The signed-in customer's order history.
 */
class OrderController extends Controller
{
    /**
     * List the customer's orders.
     */
    public function index(Request $request): Response
    {
        $orders = $request->user()
            ->orders()
            ->with('items:id,order_id,product_name,product_image,quantity')
            ->withCount('items')
            ->latest()
            ->paginate(10);

        return Inertia::render('account/orders/index', [
            'orders' => OrderResource::collection($orders),
        ]);
    }

    /**
     * Show one of the customer's orders. Other customers' orders return 404 so their existence isn't revealed.
     */
    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user()->is($request->user()), 404);

        $order->load('items.product:id,slug');

        return Inertia::render('account/orders/show', [
            'order' => OrderResource::make($order)->resolve($request),
            'justPlaced' => (bool) $request->session()->get('order_placed', false),
        ]);
    }
}
