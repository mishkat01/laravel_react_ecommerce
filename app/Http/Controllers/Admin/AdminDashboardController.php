<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Admin;
use App\Models\NewsletterSubscriber;
use App\Models\Order;
use App\Models\Product;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Number of days shown in the revenue trend.
     */
    private const REVENUE_DAYS = 14;

    /**
     * Display the admin dashboard.
     */
    public function __invoke(Request $request): Response
    {
        $billableOrders = Order::query()->where('status', '!=', OrderStatus::Cancelled);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => User::count(),
                'totalTeams' => Team::count(),
                'totalAdmins' => Admin::count(),
            ],
            'storeStats' => [
                'revenue' => (float) (clone $billableOrders)->sum('total'),
                'orders' => Order::count(),
                'pendingOrders' => Order::query()->where('status', OrderStatus::Pending)->count(),
                'averageOrderValue' => (float) (clone $billableOrders)->avg('total'),
                'products' => Product::count(),
                'activeProducts' => Product::query()->where('is_active', true)->count(),
                'lowStock' => Product::query()->where('stock_quantity', '<=', Product::LOW_STOCK_THRESHOLD)->count(),
                'subscribers' => NewsletterSubscriber::count(),
            ],
            'revenueTrend' => $this->revenueTrend(),
            'recentOrders' => OrderResource::collection(
                Order::query()->withCount('items')->latest()->take(6)->get(),
            )->resolve($request),
            'lowStockProducts' => Product::query()
                ->where('stock_quantity', '<=', Product::LOW_STOCK_THRESHOLD)
                ->orderBy('stock_quantity')
                ->take(5)
                ->get(['id', 'name', 'stock_quantity', 'images'])
                ->map(fn (Product $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'stock_quantity' => $product->stock_quantity,
                    'image' => $product->primaryImage(),
                ]),
            'recentUsers' => User::latest()
                ->take(8)
                ->get(['id', 'name', 'email', 'email_verified_at', 'created_at']),
            'systemInfo' => [
                'phpVersion' => PHP_VERSION,
                'laravelVersion' => app()->version(),
                'environment' => app()->environment(),
                'serverTime' => now()->toIso8601String(),
                'dbDriver' => config('database.default'),
            ],
        ]);
    }

    /**
     * Daily revenue from non-cancelled orders, including days without sales.
     *
     * @return list<array{date: string, total: float, orders: int}>
     */
    private function revenueTrend(): array
    {
        $since = now()->subDays(self::REVENUE_DAYS - 1)->startOfDay();

        $totals = Order::query()
            ->where('status', '!=', OrderStatus::Cancelled)
            ->where('created_at', '>=', $since)
            ->get(['total', 'created_at'])
            ->groupBy(fn (Order $order) => $order->created_at?->toDateString());

        return collect(range(0, self::REVENUE_DAYS - 1))
            ->map(function (int $offset) use ($since, $totals) {
                $date = Carbon::parse($since)->addDays($offset)->toDateString();
                $orders = $totals->get($date, collect());

                return [
                    'date' => $date,
                    'total' => round((float) $orders->sum('total'), 2),
                    'orders' => $orders->count(),
                ];
            })
            ->all();
    }
}
