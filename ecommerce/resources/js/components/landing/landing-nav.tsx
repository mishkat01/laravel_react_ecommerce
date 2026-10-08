import { Link, usePage } from '@inertiajs/react';
import {
    Heart,
    Menu,
    Moon,
    Search,
    ShoppingBag,
    Sun,
    User as UserIcon,
    X,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { dashboard, login, register } from '@/routes';
import type { CartItem } from './types';

interface LandingNavProps {
    cart: CartItem[];
    wishlist: string[];
    onOpenCart: () => void;
    onOpenWishlist: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSelectCategory?: (slug: string) => void;
}

export function LandingNav({
    cart,
    wishlist,
    onOpenCart,
    onOpenWishlist,
    searchQuery,
    onSearchChange,
    onSelectCategory,
}: LandingNavProps) {
    const { auth, currentTeam } = usePage<{
        auth: { user?: { name: string; email: string; avatar?: string } | null };
        currentTeam?: { slug: string; name: string } | null;
    }>().props;

    const { appearance, updateAppearance } = useAppearance();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showAnnouncement, setShowAnnouncement] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);

    const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    const handleNavClick = (sectionId: string, categorySlug?: string) => {
        setMobileMenuOpen(false);
        if (categorySlug && onSelectCategory) {
            onSelectCategory(categorySlug);
        }
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full transition-all">
            {/* Top Announcement Bar */}
            {showAnnouncement && (
                <div className="relative bg-primary px-4 py-2 text-primary-foreground text-xs font-medium tracking-wide">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div className="flex-1 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
                            <Sparkles className="size-3.5 text-amber-300 animate-pulse hidden sm:inline" />
                            <span>
                                Autumn / Winter Drop Live: Use code{' '}
                                <strong className="underline decoration-amber-400 font-semibold text-amber-300">
                                    ELEVATE20
                                </strong>{' '}
                                for 20% off &bull; Free express delivery over $75
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowAnnouncement(false)}
                            aria-label="Close announcement"
                            className="p-1 text-primary-foreground/70 hover:text-primary-foreground transition-colors ml-2"
                        >
                            <X className="size-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Navbar */}
            <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-8">
                        <a
                            href="/"
                            className="flex items-center gap-2.5 font-bold tracking-tight text-xl transition-opacity hover:opacity-90"
                        >
                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                                <span className="text-base font-black tracking-tighter">A</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg leading-tight font-extrabold tracking-tight">
                                    AURA<span className="text-primary font-black">.</span>
                                </span>
                                <span className="text-[10px] tracking-widest text-muted-foreground uppercase -mt-0.5">
                                    Atelier
                                </span>
                            </div>
                        </a>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                            <button
                                type="button"
                                onClick={() => handleNavClick('products', 'all')}
                                className="transition-colors hover:text-foreground cursor-pointer"
                            >
                                Shop All
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNavClick('categories')}
                                className="transition-colors hover:text-foreground cursor-pointer"
                            >
                                Collections
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNavClick('deals')}
                                className="transition-colors hover:text-foreground cursor-pointer flex items-center gap-1.5 text-rose-500 font-semibold"
                            >
                                <span>Flash Deals</span>
                                <span className="inline-block size-1.5 rounded-full bg-rose-500 animate-ping" />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNavClick('story')}
                                className="transition-colors hover:text-foreground cursor-pointer"
                            >
                                About
                            </button>
                        </div>
                    </div>

                    {/* Right Action Icons & Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Search Input Bar (Desktop or Expandable) */}
                        <div className="relative hidden lg:block w-48 xl:w-64">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full h-9 pl-9 pr-3 rounded-full border border-border bg-muted/50 text-xs focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => onSearchChange('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                                >
                                    &times;
                                </button>
                            )}
                        </div>

                        {/* Search icon for mobile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-muted-foreground hover:text-foreground"
                            onClick={() => setSearchOpen(!searchOpen)}
                            aria-label="Toggle search"
                        >
                            <Search className="size-4" />
                        </Button>

                        {/* Wishlist Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onOpenWishlist}
                            className="relative text-muted-foreground hover:text-foreground"
                            aria-label="Wishlist"
                        >
                            <Heart
                                className={`size-4.5 ${
                                    wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''
                                }`}
                            />
                            {wishlist.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                                    {wishlist.length}
                                </span>
                            )}
                        </Button>

                        {/* Shopping Cart Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenCart}
                            className="relative flex items-center gap-2 rounded-full border-border/80 px-3 py-1.5 h-9 font-medium shadow-xs hover:border-primary/50"
                            aria-label="Shopping Cart"
                        >
                            <ShoppingBag className="size-4" />
                            <span className="hidden sm:inline text-xs font-semibold">Cart</span>
                            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                                {totalCartItems}
                            </span>
                        </Button>

                        {/* Theme Switcher Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="text-muted-foreground hover:text-foreground"
                            title={`Switch to ${appearance === 'dark' ? 'Light' : 'Dark'} mode`}
                            aria-label="Toggle theme"
                        >
                            {appearance === 'dark' ? (
                                <Sun className="size-4 text-amber-400" />
                            ) : (
                                <Moon className="size-4 text-neutral-600" />
                            )}
                        </Button>

                        <div className="h-5 w-px bg-border/60 mx-0.5 hidden sm:block" />

                        {/* Auth actions: Login/Register or Dashboard */}
                        {auth.user ? (
                            <Link href={dashboardUrl}>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full text-xs font-medium"
                                >
                                    <UserIcon className="size-3.5" />
                                    <span>{auth.user.name.split(' ')[0]}</span>
                                </Button>
                            </Link>
                        ) : (
                            <div className="hidden sm:flex items-center gap-1.5">
                                <Link href={login()}>
                                    <Button variant="ghost" size="sm" className="text-xs h-8 px-3">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href={register()}>
                                    <Button size="sm" className="text-xs h-8 px-3.5 rounded-full font-medium">
                                        Join Club
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu hamburger toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden text-muted-foreground hover:text-foreground"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Open navigation menu"
                        >
                            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Search Bar Dropdown */}
                {searchOpen && (
                    <div className="lg:hidden border-t border-border px-4 py-3 bg-background">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search all products & categories..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-muted/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-background px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200">
                        <div className="flex flex-col space-y-3 font-medium text-sm">
                            <button
                                type="button"
                                onClick={() => handleNavClick('products', 'all')}
                                className="flex items-center justify-between text-left py-2 border-b border-border/40"
                            >
                                <span>Shop All Products</span>
                                <span className="text-xs text-muted-foreground">Browse</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNavClick('categories')}
                                className="flex items-center justify-between text-left py-2 border-b border-border/40"
                            >
                                <span>Curated Collections</span>
                                <span className="text-xs text-muted-foreground">5 categories</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNavClick('deals')}
                                className="flex items-center justify-between text-left py-2 border-b border-border/40 text-rose-500 font-semibold"
                            >
                                <span>Flash Deals &amp; Discounts</span>
                                <span className="text-xs bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">
                                    Limited
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNavClick('story')}
                                className="flex items-center justify-between text-left py-2 border-b border-border/40"
                            >
                                <span>Our Craft &amp; Story</span>
                            </button>
                        </div>

                        {/* Mobile Auth actions */}
                        <div className="pt-2 flex flex-col gap-2">
                            {auth.user ? (
                                <Link href={dashboardUrl} className="w-full">
                                    <Button variant="outline" className="w-full justify-center">
                                        Go to Dashboard ({auth.user.name})
                                    </Button>
                                </Link>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href={login()}>
                                        <Button variant="outline" className="w-full">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href={register()}>
                                        <Button className="w-full">
                                            Join Now
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
