import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { PRODUCTS } from '@/components/landing/data';
import { LandingCartDrawer } from '@/components/landing/landing-cart-drawer';
import { LandingCategories } from '@/components/landing/landing-categories';
import { LandingCheckoutDialog } from '@/components/landing/landing-checkout-dialog';
import { LandingDealBanner } from '@/components/landing/landing-deal-banner';
import { LandingFeatures } from '@/components/landing/landing-features';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingNewsletter } from '@/components/landing/landing-newsletter';
import { LandingProductGrid } from '@/components/landing/landing-product-grid';
import { LandingQuickViewModal } from '@/components/landing/landing-quick-view-modal';
import { LandingTestimonials } from '@/components/landing/landing-testimonials';
import type { CartItem, Product } from '@/components/landing/types';

export default function Welcome() {
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('aura_cart_v1');
                return stored ? JSON.parse(stored) : [];
            } catch {
                return [];
            }
        }
        return [];
    });

    const [wishlist, setWishlist] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('aura_wishlist_v1');
                return stored ? JSON.parse(stored) : [];
            } catch {
                return [];
            }
        }
        return [];
    });

    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    // Save cart state
    useEffect(() => {
        try {
            localStorage.setItem('aura_cart_v1', JSON.stringify(cart));
        } catch {
            // ignore storage errors
        }
    }, [cart]);

    // Save wishlist state
    useEffect(() => {
        try {
            localStorage.setItem('aura_wishlist_v1', JSON.stringify(wishlist));
        } catch {
            // ignore storage errors
        }
    }, [wishlist]);

    const handleAddToCart = (
        product: Product,
        selectedColor?: string,
        quantity: number = 1
    ) => {
        const color = selectedColor || product.colors?.[0]?.name;
        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex(
                (item) =>
                    item.product.id === product.id &&
                    item.selectedColor === color
            );

            if (existingIndex > -1) {
                const updated = [...prevCart];
                updated[existingIndex].quantity += quantity;
                return updated;
            } else {
                return [...prevCart, { product, quantity, selectedColor: color }];
            }
        });

        toast.success(`Added ${product.name} to bag`, {
            description: `${quantity}x ${color ? `(${color})` : ''} • \$${product.price * quantity}`,
            action: {
                label: 'View Bag',
                onClick: () => setCartDrawerOpen(true),
            },
        });
    };

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveItem(productId);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const handleRemoveItem = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
        toast('Item removed from bag');
    };

    const handleClearCart = () => {
        setCart([]);
        toast('Shopping bag cleared');
    };

    const handleToggleWishlist = (productId: string) => {
        const target = PRODUCTS.find((p) => p.id === productId);
        setWishlist((prev) => {
            const exists = prev.includes(productId);
            if (exists) {
                toast('Removed from saved items', {
                    description: target?.name,
                });
                return prev.filter((id) => id !== productId);
            } else {
                toast.success('Saved to your wishlist', {
                    description: target?.name,
                });
                return [...prev, productId];
            }
        });
    };

    const handleOpenWishlist = () => {
        if (wishlist.length === 0) {
            toast('Your wishlist is empty', {
                description: 'Click the heart icon on any product to save it for later.',
            });
            return;
        }
        // Switch to all category and scroll to products
        setActiveCategory('all');
        const el = document.getElementById('products');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
        toast.info(`You have ${wishlist.length} item(s) in your wishlist`);
    };

    const handleCategorySelect = (categorySlug: string) => {
        setActiveCategory(categorySlug);
        const el = document.getElementById('products');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleScrollToProducts = () => {
        const el = document.getElementById('products');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleScrollToDeals = () => {
        setActiveCategory('sale');
        const el = document.getElementById('products');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleNewsletterSubscribe = (email: string) => {
        toast.success('VIP Code Unlocked: ELEVATE20', {
            description: `We've emailed your $20 gift code to ${email}.`,
        });
    };

    const handleOrderSuccess = () => {
        setCart([]);
        toast.success('Order Successfully Confirmed! 🎉', {
            description: 'Check your email for full tracking and invoice details.',
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground font-sans">
            <Head title="Aura Atelier — Curated Essentials for Modern Living" />

            {/* Navigation Header */}
            <LandingNav
                cart={cart}
                wishlist={wishlist}
                onOpenCart={() => setCartDrawerOpen(true)}
                onOpenWishlist={handleOpenWishlist}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectCategory={handleCategorySelect}
            />

            <main>
                {/* Hero Section */}
                <LandingHero
                    onAddToCart={handleAddToCart}
                    onExploreClick={handleScrollToProducts}
                />

                {/* Brand Pillars / Value Highlights */}
                <LandingFeatures />

                {/* Visual Category Showcase */}
                <LandingCategories onSelectCategory={handleCategorySelect} />

                {/* Main Interactive Product Grid */}
                <LandingProductGrid
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={handleAddToCart}
                />

                {/* Flash Deal Banner */}
                <LandingDealBanner onShopDeals={handleScrollToDeals} />

                {/* Testimonials & Press Mentions */}
                <LandingTestimonials />

                {/* VIP Newsletter */}
                <LandingNewsletter onSubscribe={handleNewsletterSubscribe} />
            </main>

            {/* Comprehensive Footer */}
            <LandingFooter />

            {/* Interactive Cart Drawer */}
            <LandingCartDrawer
                open={cartDrawerOpen}
                onOpenChange={setCartDrawerOpen}
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onProceedCheckout={() => setCheckoutOpen(true)}
            />

            {/* Quick View Modal */}
            <LandingQuickViewModal
                product={quickViewProduct}
                open={quickViewProduct !== null}
                onOpenChange={(open) => {
                    if (!open) setQuickViewProduct(null);
                }}
                onAddToCart={handleAddToCart}
            />

            {/* Checkout Dialog */}
            <LandingCheckoutDialog
                open={checkoutOpen}
                onOpenChange={setCheckoutOpen}
                cart={cart}
                onOrderSuccess={handleOrderSuccess}
            />
        </div>
    );
}
