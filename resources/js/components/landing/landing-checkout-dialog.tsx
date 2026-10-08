import { useState } from 'react';
import {
    CheckCircle2,
    CreditCard,
    Lock,
    Package,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { CartItem } from './types';

/**
 * Props for the checkout modal dialog
 */
interface LandingCheckoutDialogProps {
    open: boolean;                  // Dialog visibility
    onOpenChange: (open: boolean) => void;
    cart: CartItem[];               // Items to purchase
    onOrderSuccess: () => void;     // Callback executed when checkout completes successfully
}

/**
 * LandingCheckoutDialog Component
 *
 * Implements a full checkout flow within a modal dialog:
 *
 * Concepts:
 * 1. **Step State Machine**: `step: 'form' | 'success'` toggles between information collection and order confirmation.
 * 2. **Controlled Form State**: Manages shipping and payment inputs in React state.
 * 3. **Asynchronous Order Simulation**: Simulates card processing with `setIsSubmitting(true)`
 *    and a 1200ms latency before transitioning to success.
 */
export function LandingCheckoutDialog({
    open,
    onOpenChange,
    cart,
    onOrderSuccess,
}: LandingCheckoutDialogProps) {
    // Current step in the checkout wizard
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Controlled checkout fields
    const [formData, setFormData] = useState({
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        address: '742 Evergreen Terrace',
        city: 'San Francisco',
        postalCode: '94107',
        paymentMethod: 'card',
    });

    // Subtotal and final total calculation
    const subtotal = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );
    const isFreeShipping = subtotal >= 75;
    const shipping = isFreeShipping ? 0 : 12;
    const total = subtotal + shipping;

    /**
     * Handles checkout form submission
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate payment gateway authorization delay
        setTimeout(() => {
            setIsSubmitting(false);
            setStep('success');
            onOrderSuccess();
        }, 1200);
    };

    /**
     * Closes the dialog and resets step to form
     */
    const handleClose = () => {
        onOpenChange(false);
        if (step === 'success') {
            setTimeout(() => setStep('form'), 300);
        }
    };


    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl p-6 sm:p-8 sm:rounded-2xl">
                {step === 'form' ? (
                    <div>
                        <DialogHeader className="mb-6 text-left">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                                <Lock className="size-3.5" />
                                <span>Encrypted Fast Checkout</span>
                            </div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                Complete Your Purchase
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Order preview snippet */}
                            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                    <span>{cart.length} unique items ({cart.reduce((a, b) => a + b.quantity, 0)} total)</span>
                                    <span className="font-bold text-foreground">Total: ${total}</span>
                                </div>
                                <div className="flex -space-x-2 overflow-hidden py-1">
                                    {cart.map((item, idx) => (
                                        <img
                                            key={idx}
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="size-9 rounded-lg border-2 border-background object-cover shadow-xs"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Contact info */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                                    Shipping Address
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.address}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address: e.target.value })
                                        }
                                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.city}
                                            onChange={(e) =>
                                                setFormData({ ...formData, city: e.target.value })
                                            }
                                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.postalCode}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    postalCode: e.target.value,
                                                })
                                            }
                                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment options */}
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                                    Demo Payment Mode
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({ ...formData, paymentMethod: 'card' })
                                        }
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                                            formData.paymentMethod === 'card'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border text-muted-foreground hover:bg-muted/30'
                                        }`}
                                    >
                                        <CreditCard className="size-4 mb-1" />
                                        <span>Credit Card</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({ ...formData, paymentMethod: 'apple' })
                                        }
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                                            formData.paymentMethod === 'apple'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border text-muted-foreground hover:bg-muted/30'
                                        }`}
                                    >
                                        <span className="font-bold mb-1"> Pay</span>
                                        <span>Apple Pay</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({ ...formData, paymentMethod: 'paypal' })
                                        }
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                                            formData.paymentMethod === 'paypal'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border text-muted-foreground hover:bg-muted/30'
                                        }`}
                                    >
                                        <span className="font-bold italic text-blue-500 mb-1">P</span>
                                        <span>PayPal</span>
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                disabled={isSubmitting}
                                className="w-full rounded-xl font-bold text-xs uppercase tracking-wider h-12 shadow-md cursor-pointer mt-4"
                            >
                                {isSubmitting ? (
                                    <span>Authorizing Payment...</span>
                                ) : (
                                    <span>Place Order &bull; ${total}</span>
                                )}
                            </Button>
                        </form>
                    </div>
                ) : (
                    /* Step 2: Order confirmation success */
                    <div className="py-6 text-center space-y-5 animate-in fade-in-50 zoom-in-95">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-10" />
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-2xl font-bold tracking-tight text-foreground">
                                Thank You for Your Order!
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                Confirmation email dispatched to{' '}
                                <strong className="text-foreground">{formData.email}</strong>.
                                Tracking details will update once dispatched.
                            </p>
                        </div>

                        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-left space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Order Reference:</span>
                                <span className="font-mono font-bold text-foreground">
                                    #AUR-{Math.floor(100000 + Math.random() * 900000)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping Speed:</span>
                                <span className="font-medium text-foreground">Express 2-Day Air</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Estimated Delivery:</span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                    Monday, Oct 12
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={handleClose}
                            className="w-full rounded-xl font-bold text-xs uppercase tracking-wider h-11"
                        >
                            Return to Store
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
