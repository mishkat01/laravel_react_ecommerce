import { useState } from 'react';
import { ArrowRight, Check, Copy, Shield, Sparkles, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRODUCTS } from './data';
import type { Product } from './types';

interface LandingHeroProps {
    onAddToCart: (product: Product, selectedColor?: string) => void;
    onExploreClick: () => void;
}

export function LandingHero({ onAddToCart, onExploreClick }: LandingHeroProps) {
    const heroProduct = PRODUCTS[0]; // Aura Horizon ANC
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [copiedCode, setCopiedCode] = useState(false);

    const activeColor = heroProduct.colors?.[selectedColorIndex] ?? {
        name: 'Matte Obsidian',
        hex: '#1C1917',
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText('ELEVATE20');
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
            {/* Subtle atmospheric background glows */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-48 size-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-1/3 -right-48 size-96 rounded-full bg-amber-500/5 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
                    {/* Left Column: Headline, Description & CTAs */}
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                        {/* Edition Chip */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3.5 py-1 text-xs font-semibold tracking-wide text-foreground shadow-2xs backdrop-blur-sm">
                            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Autumn / Winter 2026 Collection</span>
                            <span className="text-muted-foreground font-normal">| Limited Drops</span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance leading-[1.08]">
                            Curated Essentials for{' '}
                            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                                Elevated Living.
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="max-w-2xl text-base sm:text-lg text-muted-foreground text-balance leading-relaxed mx-auto lg:mx-0">
                            Immerse yourself in precision-crafted acoustics, architectural
                            workspace tools, and heavyweight organic apparel designed with timeless
                            aesthetic purity.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                            <Button
                                size="lg"
                                onClick={onExploreClick}
                                className="w-full sm:w-auto rounded-full px-8 font-semibold shadow-md gap-2 h-12 text-sm cursor-pointer group"
                            >
                                <span>Shop Curated Drop</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Button>

                            {/* Promo Code Pill with Copy */}
                            <button
                                type="button"
                                onClick={handleCopyCode}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-dashed border-primary/40 bg-primary/5 px-5 py-3 text-xs font-medium text-foreground hover:bg-primary/10 transition-all cursor-pointer"
                                title="Click to copy promo code"
                            >
                                <Sparkles className="size-3.5 text-amber-500" />
                                <span>Code: <strong>ELEVATE20</strong> (Save 20%)</span>
                                {copiedCode ? (
                                    <Check className="size-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="size-3.5 text-muted-foreground" />
                                )}
                            </button>
                        </div>

                        {/* Trust & Social Proof metrics */}
                        <div className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-xs text-muted-foreground">
                            {/* Review score */}
                            <div className="flex items-center gap-2.5">
                                <div className="flex -space-x-1.5">
                                    <img
                                        className="size-7 rounded-full border-2 border-background object-cover"
                                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                                        alt="User"
                                    />
                                    <img
                                        className="size-7 rounded-full border-2 border-background object-cover"
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                                        alt="User"
                                    />
                                    <img
                                        className="size-7 rounded-full border-2 border-background object-cover"
                                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                                        alt="User"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="size-3.5 fill-current" />
                                        ))}
                                    </div>
                                    <span className="font-semibold text-foreground">4.9/5</span> from 24K+ reviews
                                </div>
                            </div>

                            {/* Guarantee */}
                            <div className="flex items-center gap-2">
                                <Shield className="size-4 text-primary" />
                                <span>30-Day Doorstep Trial</span>
                            </div>

                            {/* Fast Delivery */}
                            <div className="flex items-center gap-2">
                                <Zap className="size-4 text-amber-500" />
                                <span>Carbon-Neutral Express</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Hero Product Showcase Card */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative w-full max-w-md">
                            {/* Decorative badge overlay */}
                            <div className="absolute -top-3 -right-3 z-20 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg flex items-center gap-1 animate-bounce">
                                <span>-20% Special Drop</span>
                            </div>

                            {/* Main Showcase Container */}
                            <div className="group overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-2xl transition-all hover:shadow-primary/5">
                                {/* Product Image Container */}
                                <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-muted/30">
                                    <img
                                        src={heroProduct.image}
                                        alt={heroProduct.name}
                                        className="size-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                    />

                                    {/* Floating Tag */}
                                    <div className="absolute bottom-3 left-3">
                                        <Badge variant="secondary" className="backdrop-blur-md bg-background/80 font-medium text-xs">
                                            Flagship Model
                                        </Badge>
                                    </div>
                                </div>

                                {/* Product Info & Interactive Controls */}
                                <div className="mt-5 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground tracking-tight">
                                                {heroProduct.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {heroProduct.subtitle}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-extrabold text-foreground">
                                                ${heroProduct.price}
                                            </div>
                                            {heroProduct.originalPrice && (
                                                <div className="text-xs text-muted-foreground line-through">
                                                    ${heroProduct.originalPrice}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Color Swatch Picker */}
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs text-muted-foreground">
                                            Finish: <span className="text-foreground font-medium">{activeColor.name}</span>
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {heroProduct.colors?.map((color, idx) => (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => setSelectedColorIndex(idx)}
                                                    className={`size-5 rounded-full border transition-all ${
                                                        selectedColorIndex === idx
                                                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                                                            : 'border-border opacity-70 hover:opacity-100'
                                                    }`}
                                                    style={{ backgroundColor: color.hex }}
                                                    title={color.name}
                                                    aria-label={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quick Add Button */}
                                    <Button
                                        onClick={() => onAddToCart(heroProduct, activeColor.name)}
                                        className="w-full rounded-xl h-11 font-semibold text-xs tracking-wide uppercase transition-all shadow-sm cursor-pointer"
                                    >
                                        Add To Bag &bull; Free Shipping
                                    </Button>

                                    <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
                                        <span>✓ 38h Wireless</span>
                                        <span>•</span>
                                        <span>✓ Active Noise Cancelling</span>
                                        <span>•</span>
                                        <span>✓ 2-Year Warranty</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
