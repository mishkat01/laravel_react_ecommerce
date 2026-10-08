export interface ProductColor {
    name: string;
    hex: string;
}

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

export interface CartItem {
    product: Product;
    quantity: number;
    selectedColor?: string;
}

export interface Category {
    id: string;
    name: string;
    description: string;
    image: string;
    itemCount: number;
    slug: string;
}

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
