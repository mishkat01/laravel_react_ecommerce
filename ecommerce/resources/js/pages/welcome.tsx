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

/**
 * Welcome Page Component (E-Commerce Storefront)
 *
 * This is the public landing page served by `Route::inertia('/', 'welcome')` in `routes/web.php`.
 *
 * Core React Concepts Demonstrated:
 * 1. **Lazy State Initialization**: `useState(() => ...)` only runs on the initial render,
 *    preventing expensive JSON parsing on every re-render.
 * 2. **Client-Side Persistence**: `useEffect` listens for cart/wishlist changes and syncs to `localStorage`.
 * 3. **Immutable State Updates**: Using functional updater patterns `setCart(prev => ...)` to ensure
 *    state integrity without mutating existing arrays or objects.
 * 4. **Component Composition**: Orchestrates modular UI components (Hero, Grid, Cart Drawer, Checkout Dialog).
 * 5. **Interactive UI Feedback**: Uses Sonner toasts with action callbacks (e.g. "View Bag").
 */
export default function Welcome() {
    /**
     * Shopping Cart State
     * Stored as an array of CartItem objects (product, quantity, selectedColor).
     * Hydrated from localStorage if available.
     */
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

    /**
     * Wishlist State
     * Array of product IDs that the user has marked as favorite.
     */
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

    // Active category filter (e.g. 'all', 'apparel', 'living', 'sale')
    const [activeCategory, setActiveCategory] = useState<string>('all');

    // Search query entered in the navigation search input
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Modal and Drawer visibility states
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    /**
     * Side Effect: Persist cart to localStorage whenever `cart` state changes
     */
    useEffect(() => {
        try {
            localStorage.setItem('aura_cart_v1', JSON.stringify(cart));
        } catch {
            // Ignore storage quota or disabled storage errors
        }
    }, [cart]);

    /**
     * Side Effect: Persist wishlist to localStorage whenever `wishlist` state changes
     */
    useEffect(() => {
        try {
            localStorage.setItem('aura_wishlist_v1', JSON.stringify(wishlist));
        } catch {
            // Ignore storage quota errors
        }
    }, [wishlist]);

    /**
     * Add a product to the cart.
     * If the product with the same color variant already exists, increment its quantity;
     * otherwise, append a new CartItem.
     */
    const handleAddToCart = (
        product: Product,
        selectedColor?: string,
        quantity: number = 1
    ) => {
        const color = selectedColor || product.colors?.[0]?.name;

        setCart((prevCart) => {
            // Find if item already exists with matching ID and color
            const existingIndex = prevCart.findIndex(
                (item) =>
                    item.product.id === product.id &&
                    item.selectedColor === color
            );

            if (existingIndex > -1) {
                // Return new array with cloned and updated item (immutability)
                const updated = [...prevCart];
                updated[existingIndex].quantity += quantity;
                return updated;
            } else {
                // Add new item to cart
                return [...prevCart, { product, quantity, selectedColor: color }];
            }
        });

        // Trigger interactive toast notification with action button
        toast.success(`Added ${product.name} to bag`, {
            description: `${quantity}x ${color ? `(${color})` : ''} • \$${product.price * quantity}`,
            action: {
                label: 'View Bag',
                onClick: () => setCartDrawerOpen(true),
            },
        });
    };

    /**
     * Update quantity for a given item in the cart.
     * If quantity reaches 0, removes the item.
     */
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

    /**
     * Remove an item from the cart by its product ID.
     */
    const handleRemoveItem = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
        toast('Item removed from bag');
    };

    /**
     * Clear all items from the cart.
     */
    const handleClearCart = () => {
        setCart([]);
        toast('Shopping bag cleared');
    };

    /**
     * Toggle a product in/out of the user's wishlist.
     */
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

    /**
     * Switch view to all products and smoothly scroll down to the product catalog.
     */
    const handleOpenWishlist = () => {
        if (wishlist.length === 0) {
            toast('Your wishlist is empty', {
                description: 'Click the heart icon on any product to save it for later.',
            });
            return;
        }
        setActiveCategory('all');
        const el = document.getElementById('products');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
        toast.info(`You have ${wishlist.length} item(s) in your wishlist`);
    };

    /**
     * Filter by category and scroll to product grid
     */
    const handleCategorySelect = (categorySlug: string) => {
        setActiveCategory(categorySlug);
        const el = document.getElementById('products');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    /**
     * Smooth scroll helper to navigate directly to products section
     */
    const handleScrollToProducts = () => {
        const el = document.getElementById('products');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    /**
     * Filter to 'sale' category and scroll to deals
     */
    const handleScrollToDeals = () => {
        setActiveCategory('sale');
        const el = document.getElementById('products');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    /**
     * Newsletter submission handler
     */
    const handleNewsletterSubscribe = (email: string) => {
        toast.success('VIP Code Unlocked: ELEVATE20', {
            description: `We've emailed your $20 gift code to ${email}.`,
        });
    };

    /**
     * Checkout completion handler: clears the cart and displays confirmation toast
     */
    const handleOrderSuccess = () => {
        setCart([]);
        toast.success('Order Successfully Confirmed! 🎉', {
            description: 'Check your email for full tracking and invoice details.',
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground font-sans">
            {/* Inertia Head: Injects dynamic browser title */}
            <Head title="Aura Atelier — Curated Essentials for Modern Living" />

            {/* Navigation Header with search, wishlist counter, and cart badge */}
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
                {/* Hero Section with featured product and CTA buttons */}
                <LandingHero
                    onAddToCart={handleAddToCart}
                    onExploreClick={handleScrollToProducts}
                />

                {/* Brand Pillars / Value Highlights */}
                <LandingFeatures />

                {/* Visual Category Showcase */}
                <LandingCategories onSelectCategory={handleCategorySelect} />

                {/* Main Interactive Product Grid (sorting, filtering, badges) */}
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

                {/* Flash Deal Banner with countdown */}
                <LandingDealBanner onShopDeals={handleScrollToDeals} />

                {/* Testimonials & Press Mentions */}
                <LandingTestimonials />

                {/* VIP Newsletter subscription */}
                <LandingNewsletter onSubscribe={handleNewsletterSubscribe} />
            </main>

            {/* Comprehensive Store Footer */}
            <LandingFooter />

            {/* Slide-over Cart Drawer */}
            <LandingCartDrawer
                open={cartDrawerOpen}
                onOpenChange={setCartDrawerOpen}
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onProceedCheckout={() => setCheckoutOpen(true)}
            />

            {/* Quick View Modal for previewing product details */}
            <LandingQuickViewModal
                product={quickViewProduct}
                open={quickViewProduct !== null}
                onOpenChange={(open) => {
                    if (!open) setQuickViewProduct(null);
                }}
                onAddToCart={handleAddToCart}
            />

            {/* Simulated Multi-Step Checkout Modal */}
            <LandingCheckoutDialog
                open={checkoutOpen}
                onOpenChange={setCheckoutOpen}
                cart={cart}
                onOrderSuccess={handleOrderSuccess}
            />
        </div>
    );
}

