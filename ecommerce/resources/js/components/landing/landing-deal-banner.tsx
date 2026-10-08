import { useEffect, useState } from 'react';
import { ArrowRight, Check, Clock, Copy, Flame, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingDealBannerProps {
    onShopDeals: () => void;
}

export function LandingDealBanner({ onShopDeals }: LandingDealBannerProps) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 14,
        minutes: 32,
        seconds: 45,
    });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                }
                if (prev.minutes > 0) {
                    return { ...prev, minutes: 59, seconds: 59 };
                }
                if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return { hours: 24, minutes: 0, seconds: 0 };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const copyCode = () => {
        navigator.clipboard.writeText('ELEVATE20');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const pad = (n: number) => n.toString().padStart(2, '0');

    return (
        <section id="deals" className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-neutral-950 px-6 py-12 text-white shadow-2xl sm:px-12 lg:py-16 dark:border dark:border-neutral-800">
                    {/* Background glow effects */}
                    <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-rose-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-amber-500/15 blur-3xl" />

                    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Left column */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 border border-rose-500/30 px-3.5 py-1 text-xs font-bold text-rose-400">
                                <Flame className="size-3.5 fill-rose-500 text-rose-500" />
                                <span>LIMITED FLASH EVENT</span>
                            </div>

                            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl text-white">
                                Save 20% Extra Across Audio &amp; Desk Series.
                            </h2>

                            <p className="text-sm sm:text-base text-neutral-400 max-w-xl">
                                For the next few hours, claim an additional 20% discount on all
                                studio ANC headphones, titanium chronos, and precision keyboards.
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Button
                                    size="lg"
                                    onClick={onShopDeals}
                                    className="rounded-full bg-white text-neutral-950 hover:bg-neutral-100 font-bold px-7 h-11 text-xs tracking-wide uppercase gap-2 cursor-pointer"
                                >
                                    <span>Claim Flash Deals</span>
                                    <ArrowRight className="size-4" />
                                </Button>

                                <button
                                    type="button"
                                    onClick={copyCode}
                                    className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/80 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                                >
                                    <Sparkles className="size-3.5 text-amber-400" />
                                    <span>Code: ELEVATE20</span>
                                    {copied ? (
                                        <Check className="size-3.5 text-emerald-400" />
                                    ) : (
                                        <Copy className="size-3.5 text-neutral-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Right column: Countdown timer cards */}
                        <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
                            <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 backdrop-blur-md">
                                <div className="flex items-center justify-between text-xs text-neutral-400 mb-4 pb-3 border-b border-neutral-800">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Clock className="size-3.5 text-amber-400" />
                                        Offer expires in:
                                    </span>
                                    <span className="text-emerald-400 font-semibold">Active Now</span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3">
                                        <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                                            {pad(timeLeft.hours)}
                                        </div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-semibold mt-1">
                                            Hours
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3">
                                        <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                                            {pad(timeLeft.minutes)}
                                        </div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-semibold mt-1">
                                            Minutes
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3">
                                        <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                                            {pad(timeLeft.seconds)}
                                        </div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-semibold mt-1">
                                            Seconds
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[11px] text-neutral-500 text-center mt-4">
                                    Free worldwide doorstep delivery included with all promotional orders.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
