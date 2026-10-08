/**
 * Product Color Variant Definition
 */
export interface ProductColor {
    name: string; // e.g. "Space Black"
    hex: string;  // e.g. "#1C1C1E"
}

/**
 * Product Model Definition
 * Represents a catalog item in the e-commerce storefront.
 */
export interface Product {
    id: string;
    name: string;
    subtitle: string;
    description: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewsCount: number;
    category: string;
    image: string;
    gallery?: string[];
    tag?: string;
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
    colors?: ProductColor[];
    features?: string[];
    inStock?: boolean;
    isFeatured?: boolean;
    isSale?: boolean;
}

/**
 * Cart Item Model Definition
 * Represents a product placed in the user's shopping bag with chosen quantity and variant.
 */
export interface CartItem {
    product: Product;
    quantity: number;
    selectedColor?: string;
}

/**
 * Category Definition
 * Defines department/collection metadata for catalog filtering.
 */
export interface Category {
    id: string;
    name: string;
    description: string;
    image: string;
    itemCount: number;
    slug: string;
}

/**
 * Testimonial Definition
 * Verified customer reviews shown in the storefront social-proof section.
 */
export interface Testimonial {
    id: string;
    author: string;
    role: string;
    avatar: string;
    rating: number;
    content: string;
    productName: string;
    verified: boolean;
}

