<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Order fulfilment: browse orders and move them through their lifecycle.
 */
class OrderController extends Controller
{
    /**
     * Display the order list.
     */
    public function index(Request $request): Response
    {
        $status = OrderStatus::tryFrom((string) $request->query('status'));
        $term = trim((string) $request->string('q')) ?: null;

        $orders = Order::query()
            ->withCount('items')
            ->when($status, fn (Builder $query, OrderStatus $status) => $query->where('status', $status))
            ->when($term, fn (Builder $query, string $term) => $query->where(fn (Builder $query) => $query
                ->where('number', 'like', "%{$term}%")
                ->orWhere('customer_name', 'like', "%{$term}%")
                ->orWhere('customer_email', 'like', "%{$term}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => OrderResource::collection($orders),
            'filters' => ['status' => $status?->value, 'q' => $term],
            'statuses' => OrderStatus::options(),
            'statusCounts' => Order::query()
                ->selectRaw('status, count(*) as aggregate')
                ->groupBy('status')
                ->pluck('aggregate', 'status'),
        ]);
    }

    /**
     * Display a single order.
     */
    public function show(Order $order): Response
    {
        $order->load(['items.product:id,slug', 'user:id,name,email']);

        return Inertia::render('admin/orders/show', [
            'order' => OrderResource::make($order)->resolve(),
            'customer' => $order->user?->only(['id', 'name', 'email']),
            'customerOrdersCount' => $order->user?->orders()->count() ?? 0,
            'statuses' => OrderStatus::options(),
            'paymentStatuses' => PaymentStatus::options(),
        ]);
    }

    /**
     * Update the order and payment status. Cancelling returns the items to stock.
     */
    public function update(UpdateOrderRequest $request, Order $order): RedirectResponse
    {
        $status = OrderStatus::from($request->string('status'));

        DB::transaction(function () use ($order, $status, $request) {
            if ($status === OrderStatus::Cancelled && $order->status->holdsStock()) {
                $order->items()->whereNotNull('product_id')->with('product')->get()->each(function (OrderItem $item) {
                    $item->product?->increment('stock_quantity', $item->quantity);
                    $item->product?->decrement('sales_count', min($item->quantity, $item->product->sales_count));
                });
            }

            $order->update([
                'status' => $status,
                'payment_status' => PaymentStatus::from($request->string('payment_status')),
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Order :number updated.', ['number' => $order->number])]);

        return back();
    }
}
