import { Leaf, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

/**
 * Brand Value Pillars / Guarantees
 * Declared outside component scope to avoid re-allocating the array on every render.
 */
const FEATURES = [
    {
        title: 'Global Express Delivery',
        description: 'Complimentary expedited shipping on all orders over $75 with real-time GPS tracking.',
        icon: Truck,
        highlight: 'Free over $75',
    },
    {
        title: '30-Day Doorstep Trial',
        description: 'Experience items in your daily routine. Free pre-paid doorstep return labels included.',
        icon: RotateCcw,
        highlight: 'Zero Risk',
    },
    {
        title: '2-Year Hardware Warranty',
        description: 'Machined from aerospace titanium and premium alloys. Guaranteed against any defects.',
        icon: ShieldCheck,
        highlight: 'Full Replacement',
    },
    {
        title: 'Carbon-Neutral Impact',
        description: '100% biodegradable FSC packaging, plastic-free tapes, and climate-offset logistics.',
        icon: Leaf,
        highlight: '100% Eco-Crafted',
    },
];

/**
 * LandingFeatures Component
 *
 * Renders trust signals and value propositions:
 * - Dynamic Lucide icon rendering: `const Icon = item.icon; <Icon />`
 * - 4-column responsive grid on desktop (`lg:grid-cols-4`), 2-column on tablet, 1-column on mobile.
 */
export function LandingFeatures() {
    return (
        <section className="border-y border-border/60 bg-muted/30 py-12">

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xs transition-all hover:border-primary/40 hover:bg-card hover:shadow-md"
                            >
                                <div className="space-y-4">
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        <Icon className="size-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-sm tracking-tight text-foreground">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-border/40">
                                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                                        {item.highlight}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
