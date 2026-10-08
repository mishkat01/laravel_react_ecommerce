import { useState } from 'react';
import {
    Check,
    Minus,
    Plus,
    RotateCcw,
    ShieldCheck,
    ShoppingBag,
    Star,
    Truck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Product } from './types';

interface LandingQuickViewModalProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddToCart: (product: Product, selectedColor?: string, quantity?: number) => void;
}

export function LandingQuickViewModal({
    product,
    open,
    onOpenChange,
    onAddToCart,
}: LandingQuickViewModalProps) {
    if (!product) return null;

    const [selectedImage, setSelectedImage] = useState<string>(product.image);
    const [selectedColor, setSelectedColor] = useState<string>(
        product.colors?.[0]?.name || ''
    );
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    // Sync selected image if product changes
    const images = product.gallery || [product.image];
    const displayImage = selectedImage || product.image;

    const handleAdd = () => {
        onAddToCart(product, selectedColor || product.colors?.[0]?.name, quantity);
        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            onOpenChange(false);
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl overflow-hidden p-0 sm:rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left: Gallery & Main Image */}
                    <div className="bg-muted/40 p-6 flex flex-col justify-between">
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-card border border-border/60">
                            <img
                                src={displayImage}
                                alt={product.name}
                                className="size-full object-cover object-center transition-all duration-300"
                            />
                            {product.tag && (
                                <div className="absolute top-3 left-3">
                                    <Badge variant={product.badgeVariant || 'default'}>
                                        {product.tag}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Bar */}
                        {images.length > 1 && (
                            <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedImage(img)}
                                        className={`size-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                            displayImage === img
                                                ? 'border-primary ring-2 ring-primary/20'
                                                : 'border-border opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details & Purchase Actions */}
                    <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5 max-h-[85vh] overflow-y-auto">
                        <div className="space-y-4">
                            <DialogHeader className="text-left space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                                        {product.category.replace('-', ' & ')}
                                    </span>
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        In Stock
                                    </span>
                                </div>
                                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                    {product.name}
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground">
                                    {product.subtitle}
                                </p>
                            </DialogHeader>

                            {/* Rating and Price */}
                            <div className="flex items-center justify-between border-y border-border/50 py-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-foreground">
                                        ${product.price}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-sm text-muted-foreground line-through">
                                            ${product.originalPrice}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <div className="flex text-amber-400">
                                        <Star className="size-3.5 fill-current" />
                                    </div>
                                    <span className="font-bold">{product.rating}</span>
                                    <span className="text-muted-foreground">
                                        ({product.reviewsCount} reviews)
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>

                            {/* Color Selector */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Color Finish:</span>
                                        <span className="font-semibold text-foreground">
                                            {selectedColor || product.colors[0].name}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {product.colors.map((c) => {
                                            const isCurrent =
                                                (selectedColor || product.colors?.[0].name) ===
                                                c.name;
                                            return (
                                                <button
                                                    key={c.name}
                                                    type="button"
                                                    onClick={() => setSelectedColor(c.name)}
                                                    className={`size-7 rounded-full border transition-all cursor-pointer ${
                                                        isCurrent
                                                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                                                            : 'border-border/80 opacity-70 hover:opacity-100'
                                                    }`}
                                                    style={{ backgroundColor: c.hex }}
                                                    title={c.name}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Features list */}
                            {product.features && (
                                <div className="space-y-1.5 pt-2">
                                    <span className="text-xs font-semibold text-foreground">
                                        Key Highlights:
                                    </span>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                        {product.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <Check className="size-3 text-emerald-500 shrink-0" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Actions Bar */}
                        <div className="space-y-3 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-3">
                                {/* Quantity controls */}
                                <div className="flex items-center rounded-xl border border-border bg-muted/40 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="size-7 flex items-center justify-center rounded-lg hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        <Minus className="size-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-foreground">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="size-7 flex items-center justify-center rounded-lg hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        <Plus className="size-3.5" />
                                    </button>
                                </div>

                                {/* Add to Cart Button */}
                                <Button
                                    size="lg"
                                    onClick={handleAdd}
                                    className={`flex-1 rounded-xl font-bold text-xs uppercase tracking-wider h-11 gap-2 cursor-pointer ${
                                        added
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            : ''
                                    }`}
                                >
                                    {added ? (
                                        <>
                                            <Check className="size-4" />
                                            <span>Added to Bag</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="size-4" />
                                            <span>Add &bull; ${product.price * quantity}</span>
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Trust footnotes */}
                            <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground pt-1 text-center">
                                <span className="flex items-center justify-center gap-1">
                                    <Truck className="size-3 text-primary" /> Free Shipping
                                </span>
                                <span className="flex items-center justify-center gap-1">
                                    <RotateCcw className="size-3 text-primary" /> 30-Day Return
                                </span>
                                <span className="flex items-center justify-center gap-1">
                                    <ShieldCheck className="size-3 text-primary" /> 2-Yr Warranty
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
