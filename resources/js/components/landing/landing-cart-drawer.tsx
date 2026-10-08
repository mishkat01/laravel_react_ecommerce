import { useState } from 'react';
import {
    ArrowRight,
    Check,
    Lock,
    Minus,
    Plus,
    ShoppingBag,
    Sparkles,
    Trash2,
    Truck,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type { CartItem } from './types';

/**
 * Props for the slide-over shopping cart drawer
 */
interface LandingCartDrawerProps {
    open: boolean;                                                          // Visibility of the slide-over drawer
    onOpenChange: (open: boolean) => void;                                  // Drawer open/close callback
    cart: CartItem[];                                                       // Current shopping cart items
    onUpdateQuantity: (productId: string, quantity: number) => void;        // Quantity stepper callback
    onRemoveItem: (productId: string) => void;                              // Item deletion callback
    onClearCart: () => void;                                                // Clear entire cart callback
    onProceedCheckout: () => void;                                          // Opens checkout modal callback
}

/**
 * LandingCartDrawer Component
 *
 * Implements a side-sliding cart drawer using Radix UI `<Sheet>`.
 *
 * Financial & State Calculations:
 * 1. **Subtotal**: Iterates over cart items multiplying price by quantity.
 * 2. **Discount Logic**: Validates promotional voucher code `ELEVATE20` for 20% off.
 * 3. **Dynamic Shipping Threshold**: Calculates remaining spend needed to unlock free shipping ($75).
 * 4. **Grand Total**: Computes final charge including subtotal, discounts, and shipping fees.
 */
export function LandingCartDrawer({
    open,
    onOpenChange,
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onProceedCheckout,
}: LandingCartDrawerProps) {
    // Promo voucher state
    const [couponCode, setCouponCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(false);
    const [couponError, setCouponError] = useState('');

    // Cart calculations
    const subtotal = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const discountAmount = discountApplied ? Math.round(subtotal * 0.2) : 0;
    const freeShippingThreshold = 75;
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
    const isFreeShipping = subtotal >= freeShippingThreshold;
    const shippingCost = subtotal > 0 && !isFreeShipping ? 12 : 0;
    const grandTotal = subtotal - discountAmount + shippingCost;

    /**
     * Coupon code submission: verifies promo code string
     */
    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        const code = couponCode.trim().toUpperCase();
        if (code === 'ELEVATE20') {
            setDiscountApplied(true);
            setCouponError('');
        } else {
            setCouponError('Invalid code. Try ELEVATE20');
        }
    };

    /**
     * Resets promo code and removes discount
     */
    const handleRemoveCoupon = () => {
        setDiscountApplied(false);
        setCouponCode('');
        setCouponError('');
    };


    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex flex-col w-full sm:max-w-md p-0 bg-background"
            >
                {/* Header */}
                <SheetHeader className="p-6 border-b border-border/60">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="size-5 text-primary" />
                            <SheetTitle className="text-lg font-bold tracking-tight">
                                Your Shopping Bag
                            </SheetTitle>
                            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
                                {cart.reduce((a, b) => a + b.quantity, 0)}
                            </span>
                        </div>
                        {cart.length > 0 && (
                            <button
                                type="button"
                                onClick={onClearCart}
                                className="text-xs text-muted-foreground hover:text-rose-500 transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Free shipping meter */}
                    {cart.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/40">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="flex items-center gap-1.5 font-medium text-foreground">
                                    <Truck className="size-3.5 text-primary" />
                                    {isFreeShipping ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                            Free express shipping unlocked! 🎉
                                        </span>
                                    ) : (
                                        <span>
                                            Add <strong className="text-foreground">${remainingForFreeShipping}</strong> more for Free Shipping
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500 rounded-full"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            (subtotal / freeShippingThreshold) * 100
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </SheetHeader>

                {/* Body: Items or Empty state */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-16">
                            <div className="size-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                                <ShoppingBag className="size-8" />
                            </div>
                            <h3 className="font-bold text-base text-foreground">
                                Your bag is currently empty
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-6">
                                Discover our curated acoustics, ergonomic workspace tools, and timeless apparel.
                            </p>
                            <Button
                                onClick={() => onOpenChange(false)}
                                className="rounded-full text-xs font-semibold px-6"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 divide-y divide-border/40">
                            {cart.map((item) => (
                                <div
                                    key={`${item.product.id}-${item.selectedColor || ''}`}
                                    className="pt-4 first:pt-0 flex gap-4 items-start"
                                >
                                    {/* Thumbnail */}
                                    <div className="size-20 rounded-xl overflow-hidden bg-muted/30 border border-border/60 shrink-0">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="size-full object-cover"
                                        />
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                                                    {item.product.name}
                                                </h4>
                                                {item.selectedColor && (
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                                        Finish: {item.selectedColor}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="font-bold text-xs sm:text-sm text-foreground">
                                                ${item.product.price * item.quantity}
                                            </span>
                                        </div>

                                        {/* Quantity & Remove controls */}
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onUpdateQuantity(
                                                            item.product.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="size-6 flex items-center justify-center rounded hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    <Minus className="size-3" />
                                                </button>
                                                <span className="w-6 text-center text-xs font-bold text-foreground">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onUpdateQuantity(
                                                            item.product.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="size-6 flex items-center justify-center rounded hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    <Plus className="size-3" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => onRemoveItem(item.product.id)}
                                                className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                                                title="Remove item"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer calculations & checkout */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-border/60 bg-muted/20 space-y-4">
                        {/* Coupon Form */}
                        {!discountApplied ? (
                            <form onSubmit={handleApplyCoupon} className="space-y-1">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Promo Code (try ELEVATE20)"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs uppercase font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        size="sm"
                                        className="h-9 px-3 text-xs font-semibold"
                                    >
                                        Apply
                                    </Button>
                                </div>
                                {couponError && (
                                    <p className="text-[11px] text-rose-500 font-medium">
                                        {couponError}
                                    </p>
                                )}
                            </form>
                        ) : (
                            <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Sparkles className="size-3.5" />
                                    <span>Code <strong>ELEVATE20</strong> applied (20% OFF)</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={handleRemoveCoupon}
                                    className="text-muted-foreground hover:text-foreground p-0.5"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Calculation summary */}
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="font-medium text-foreground">${subtotal}</span>
                            </div>

                            {discountApplied && (
                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                    <span>Discount (20%)</span>
                                    <span>-${discountAmount}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span>{isFreeShipping ? 'FREE' : `$${shippingCost}`}</span>
                            </div>

                            <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border/60">
                                <span>Total Estimated</span>
                                <span className="text-base">${grandTotal}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <Button
                            size="lg"
                            onClick={() => {
                                onOpenChange(false);
                                onProceedCheckout();
                            }}
                            className="w-full rounded-xl font-bold text-xs uppercase tracking-wider h-12 shadow-sm gap-2 cursor-pointer"
                        >
                            <span>Proceed to Checkout</span>
                            <ArrowRight className="size-4" />
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                            <Lock className="size-3 text-muted-foreground" />
                            <span>256-Bit SSL Encrypted &bull; Guaranteed Delivery</span>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
