import { useState } from 'react';
import { ArrowRight, Check, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Props for the newsletter subscription section
 */
interface LandingNewsletterProps {
    onSubscribe: (email: string) => void; // Callback executed on valid subscription
}

/**
 * LandingNewsletter Component
 *
 * VIP newsletter subscription banner.
 *
 * Demonstrates:
 * 1. **Controlled Input Pattern**: Input state bound via `value={email}` and `onChange={(e) => setEmail(e.target.value)}`.
 * 2. **Conditional State Swapping**: When `subscribed = true`, replaces the input form with
 *    a confirmation alert using Tailwind enter animations (`animate-in fade-in zoom-in-95`).
 */
export function LandingNewsletter({ onSubscribe }: LandingNewsletterProps) {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    /**
     * Email submission handler with baseline client-side validation
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) return;
        onSubscribe(email);
        setSubscribed(true);
    };


    return (
        <section className="py-20 border-t border-border/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-card border border-border/80 p-8 sm:p-12 lg:p-16 text-center shadow-lg">
                    {/* Atmospheric glow */}
                    <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/10 blur-3xl" />

                    <div className="relative max-w-2xl mx-auto space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                            <Sparkles className="size-3.5" />
                            <span>AURA COLLECTIVE VIP</span>
                        </div>

                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                            Receive $20 Toward Your Next Order
                        </h2>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Subscribe to unlock secret seasonal drops, bespoke invites, and curated design essays before the general public.
                        </p>

                        {subscribed ? (
                            <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-3.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in zoom-in-95">
                                <Check className="size-4" />
                                <span>Welcome to the club! We sent your $20 code to {email}.</span>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2"
                            >
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your email address..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-11 rounded-xl px-6 text-xs font-bold uppercase tracking-wider gap-2 shadow-xs cursor-pointer"
                                >
                                    <span>Join Free</span>
                                    <ArrowRight className="size-3.5" />
                                </Button>
                            </form>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-muted-foreground pt-3">
                            <span>• No spam ever</span>
                            <span>• Instant \$20 voucher</span>
                            <span>• Unsubscribe in 1-click</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
