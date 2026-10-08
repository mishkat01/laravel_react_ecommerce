import { useState } from 'react';
import {
    ArrowUpDown,
    Check,
    Eye,
    Heart,
    Search,
    ShoppingBag,
    Star,
    Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PRODUCTS } from './data';
import type { Product } from './types';

interface LandingProductGridProps {
    activeCategory: string;
    onCategoryChange: (cat: string) => void;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    wishlist: string[];
    onToggleWishlist: (productId: string) => void;
    onQuickView: (product: Product) => void;
    onAddToCart: (product: Product, selectedColor?: string) => void;
}

export function LandingProductGrid({
    activeCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
    wishlist,
    onToggleWishlist,
    onQuickView,
    onAddToCart,
}: LandingProductGridProps) {
    const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
    const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
    const [addedId, setAddedId] = useState<string | null>(null);

    const categories = [
        { label: 'All Catalog', value: 'all' },
        { label: 'Audio & Tech', value: 'audio-tech' },
        { label: 'Workspace', value: 'workspace' },
        { label: 'Apparel', value: 'apparel' },
        { label: 'Accessories', value: 'accessories' },
        { label: 'Home & Living', value: 'home-living' },
        { label: '⚡ Flash Sale', value: 'sale' },
    ];

    // Filter products
    const filteredProducts = PRODUCTS.filter((product) => {
        // Category filter
        if (activeCategory === 'sale') {
            if (!product.isSale) return false;
        } else if (activeCategory !== 'all') {
            if (product.category !== activeCategory) return false;
        }

        // Search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchName = product.name.toLowerCase().includes(query);
            const matchDesc = product.description.toLowerCase().includes(query);
            const matchSub = product.subtitle.toLowerCase().includes(query);
            if (!matchName && !matchDesc && !matchSub) return false;
        }

        return true;
    });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // featured default
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

    const handleSelectColor = (productId: string, colorName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedColors((prev) => ({ ...prev, [productId]: colorName }));
    };

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.stopPropagation();
        const activeColor = selectedColors[product.id] || product.colors?.[0]?.name;
        onAddToCart(product, activeColor);
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    return (
        <section id="products" className="py-16 border-t border-border/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header Title */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
                    <div>
                        <div className="text-xs font-bold tracking-widest text-primary uppercase flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-amber-500" />
                            <span>Featured Catalog</span>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mt-1 text-foreground">
                            Crafted Without Compromise
                        </h2>
                    </div>

                    {/* Sorting selector */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <ArrowUpDown className="size-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                            <option value="featured">Featured Picks</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>
                </div>

                {/* Filter Tabs Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat.value;
                        return (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => onCategoryChange(cat.value)}
                                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Results count & active search badge */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
                    <div>
                        Showing <strong className="text-foreground">{sortedProducts.length}</strong> items
                        {searchQuery && (
                            <span>
                                {' '}
                                matching &ldquo;<span className="text-foreground font-medium">{searchQuery}</span>&rdquo;
                            </span>
                        )}
                    </div>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="text-primary hover:underline font-medium"
                        >
                            Clear search
                        </button>
                    )}
                </div>

                {/* Products Grid */}
                {sortedProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 px-4 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
                            <Search className="size-6" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No matching products found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
                            Try adjusting your filters or searching for terms like &ldquo;Headphones&rdquo;, &ldquo;Watch&rdquo;, or &ldquo;Lamp&rdquo;.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                onSearchChange('');
                                onCategoryChange('all');
                            }}
                        >
                            Reset All Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedProducts.map((product) => {
                            const isWishlisted = wishlist.includes(product.id);
                            const activeColorName =
                                selectedColors[product.id] || product.colors?.[0]?.name;
                            const isJustAdded = addedId === product.id;

                            return (
                                <div
                                    key={product.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-xl"
                                >
                                    <div>
                                        {/* Image Container with Badges & Action Overlays */}
                                        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/40">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                                            />

                                            {/* Tag / Sale Badge */}
                                            {product.tag && (
                                                <div className="absolute top-3 left-3 z-10">
                                                    <Badge
                                                        variant={product.badgeVariant || 'secondary'}
                                                        className="text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs"
                                                    >
                                                        {product.tag}
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Wishlist Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleWishlist(product.id);
                                                }}
                                                className="absolute top-3 right-3 z-10 flex size-8.5 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-md shadow-2xs transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                                                aria-label="Toggle wishlist"
                                            >
                                                <Heart
                                                    className={`size-4 transition-colors ${
                                                        isWishlisted
                                                            ? 'fill-rose-500 text-rose-500'
                                                            : 'text-foreground/80 hover:text-foreground'
                                                    }`}
                                                />
                                            </button>

                                            {/* Hover Quick Actions */}
                                            <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => onQuickView(product)}
                                                    className="w-full rounded-lg bg-background/90 text-foreground backdrop-blur-md hover:bg-background text-xs h-9 shadow-sm font-medium gap-1.5 cursor-pointer"
                                                >
                                                    <Eye className="size-3.5" />
                                                    <span>Quick View</span>
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Content details */}
                                        <div className="mt-4 space-y-2">
                                            {/* Color dots */}
                                            {product.colors && product.colors.length > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    {product.colors.map((c) => {
                                                        const isSelected = activeColorName === c.name;
                                                        return (
                                                            <button
                                                                key={c.name}
                                                                type="button"
                                                                onClick={(e) => handleSelectColor(product.id, c.name, e)}
                                                                className={`size-3.5 rounded-full border transition-all ${
                                                                    isSelected
                                                                        ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110'
                                                                        : 'border-border/80 opacity-70 hover:opacity-100'
                                                                }`}
                                                                style={{ backgroundColor: c.hex }}
                                                                title={c.name}
                                                            />
                                                        );
                                                    })}
                                                    <span className="text-[10px] text-muted-foreground ml-1 truncate">
                                                        {activeColorName}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Title & Subtitle */}
                                            <div>
                                                <h3
                                                    onClick={() => onQuickView(product)}
                                                    className="font-bold text-sm text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer line-clamp-1"
                                                >
                                                    {product.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                    {product.subtitle}
                                                </p>
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <div className="flex text-amber-400">
                                                    <Star className="size-3.5 fill-current" />
                                                </div>
                                                <span className="font-semibold text-foreground text-xs">
                                                    {product.rating}
                                                </span>
                                                <span className="text-muted-foreground text-[11px]">
                                                    ({product.reviewsCount})
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Add to Bag footer */}
                                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="font-bold text-base text-foreground">
                                                    ${product.price}
                                                </span>
                                                {product.originalPrice && (
                                                    <span className="text-xs text-muted-foreground line-through">
                                                        ${product.originalPrice}
                                                    </span>
                                                )}
                                            </div>
                                            {product.originalPrice && (
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                    Save ${product.originalPrice - product.price}
                                                </span>
                                            )}
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={(e) => handleAddToCart(product, e)}
                                            className={`rounded-xl text-xs h-9 px-3 font-semibold transition-all cursor-pointer ${
                                                isJustAdded
                                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                    : ''
                                            }`}
                                        >
                                            {isJustAdded ? (
                                                <>
                                                    <Check className="size-3.5" />
                                                    <span>Added</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingBag className="size-3.5" />
                                                    <span>Add</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
