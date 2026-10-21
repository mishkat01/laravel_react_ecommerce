<?php

namespace App\Services;

use App\Models\SiteSetting;

/**
 * StorefrontSettings
 *
 * Reads and writes the admin-editable storefront content. Every section has defaults,
 * so the storefront renders before an admin saves anything. Stored values are merged
 * over the defaults key-by-key, which lets new keys ship with sensible fallbacks.
 *
 * Bound as a scoped singleton so the settings are queried at most once per request.
 */
class StorefrontSettings
{
    /**
     * Sections that can be edited from the admin panel.
     *
     * @var list<string>
     */
    public const SECTIONS = [
        'store',
        'announcement',
        'hero',
        'features',
        'categories',
        'products',
        'deal',
        'testimonials',
        'newsletter',
        'footer',
    ];

    /**
     * Icons the admin may choose for feature and trust items. Mirrors the icon map on the frontend.
     *
     * @var list<string>
     */
    public const ICONS = [
        'Truck', 'RotateCcw', 'ShieldCheck', 'Shield', 'Leaf', 'Zap', 'Gift', 'Headphones',
        'CreditCard', 'Clock', 'Award', 'Heart', 'Star', 'Sparkles', 'Package', 'Lock',
        'Globe', 'ThumbsUp', 'Recycle', 'Phone',
    ];

    /**
     * Social platforms supported in the footer.
     *
     * @var list<string>
     */
    public const SOCIAL_PLATFORMS = ['twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'linkedin', 'github'];

    /**
     * Memoized stored values keyed by section.
     *
     * @var array<string, array<string, mixed>>|null
     */
    private ?array $stored = null;

    /**
     * Get one section merged over its defaults.
     *
     * @return array<string, mixed>
     */
    public function section(string $section): array
    {
        return array_replace(self::defaults()[$section] ?? [], $this->stored()[$section] ?? []);
    }

    /**
     * Get every section merged over its defaults.
     *
     * @return array<string, array<string, mixed>>
     */
    public function all(): array
    {
        return collect(self::SECTIONS)
            ->mapWithKeys(fn (string $section) => [$section => $this->section($section)])
            ->all();
    }

    /**
     * Persist a section.
     *
     * @param  array<string, mixed>  $value
     */
    public function update(string $section, array $value): void
    {
        SiteSetting::query()->updateOrCreate(['key' => $section], ['value' => $value]);

        $this->stored = null;
    }

    /**
     * Load stored values once per request.
     *
     * @return array<string, array<string, mixed>>
     */
    private function stored(): array
    {
        return $this->stored ??= SiteSetting::query()
            ->whereIn('key', self::SECTIONS)
            ->pluck('value', 'key')
            ->all();
    }

    /**
     * Default content for every section.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function defaults(): array
    {
        return [
            'store' => [
                'name' => 'Aura Atelier',
                'tagline' => 'Curated Essentials for Modern Living',
                'logo_text' => 'A',
                'currency' => 'USD',
                'support_email' => 'support@aura-atelier.test',
                'support_phone' => '',
                'shipping_fee' => 12,
                'free_shipping_threshold' => 75,
            ],
            'announcement' => [
                'enabled' => true,
                'text' => 'Autumn / Winter Drop Live: 20% off with code',
                'code' => 'ELEVATE20',
                'link_label' => 'Shop the drop',
                'link_url' => '/shop',
            ],
            'hero' => [
                'badge' => 'Autumn / Winter 2026 Collection',
                'badge_note' => 'Limited Drops',
                'title' => 'Curated Essentials for',
                'highlight' => 'Elevated Living.',
                'description' => 'Immerse yourself in precision-crafted acoustics, architectural workspace tools, and heavyweight organic apparel designed with timeless aesthetic purity.',
                'cta_label' => 'Shop Curated Drop',
                'cta_url' => '/shop',
                'promo_code' => 'ELEVATE20',
                'promo_label' => 'Save 20%',
                'product_id' => null,
                'product_label' => 'Flagship Model',
                'ribbon' => '-20% Special Drop',
                'highlights' => ['38h Wireless', 'Active Noise Cancelling', '2-Year Warranty'],
                'rating_value' => '4.9/5',
                'rating_label' => 'from 24K+ reviews',
                'avatars' => [
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80',
                ],
                'trust_items' => [
                    ['icon' => 'Shield', 'text' => '30-Day Doorstep Trial'],
                    ['icon' => 'Zap', 'text' => 'Carbon-Neutral Express'],
                ],
            ],
            'features' => [
                'enabled' => true,
                'items' => [
                    ['icon' => 'Truck', 'title' => 'Global Express Delivery', 'description' => 'Complimentary expedited shipping on all orders over $75 with real-time GPS tracking.', 'highlight' => 'Free over $75'],
                    ['icon' => 'RotateCcw', 'title' => '30-Day Doorstep Trial', 'description' => 'Experience items in your daily routine. Free pre-paid doorstep return labels included.', 'highlight' => 'Zero Risk'],
                    ['icon' => 'ShieldCheck', 'title' => '2-Year Hardware Warranty', 'description' => 'Machined from aerospace titanium and premium alloys. Guaranteed against any defects.', 'highlight' => 'Full Replacement'],
                    ['icon' => 'Leaf', 'title' => 'Carbon-Neutral Impact', 'description' => '100% biodegradable FSC packaging, plastic-free tapes, and climate-offset logistics.', 'highlight' => '100% Eco-Crafted'],
                ],
            ],
            'categories' => [
                'enabled' => true,
                'eyebrow' => 'Curated Portfolios',
                'title' => 'Explore By Category',
                'description' => 'Every product is thoughtfully developed with uncompromising precision, minimalist aesthetics, and sustainable engineering.',
                'limit' => 5,
            ],
            'products' => [
                'enabled' => true,
                'eyebrow' => 'Featured Catalog',
                'title' => 'Crafted Without Compromise',
                'limit' => 8,
                'cta_label' => 'View all products',
            ],
            'deal' => [
                'enabled' => true,
                'eyebrow' => 'Limited Flash Event',
                'title' => 'Save 20% Extra Across Audio & Desk Series.',
                'description' => 'For the next few hours, claim an additional 20% discount on all studio ANC headphones, titanium chronos, and precision keyboards.',
                'cta_label' => 'Claim Flash Deals',
                'cta_url' => '/shop?on_sale=1',
                'code' => 'ELEVATE20',
                'ends_at' => null,
                'footnote' => 'Free worldwide doorstep delivery included with all promotional orders.',
            ],
            'testimonials' => [
                'enabled' => true,
                'press_label' => 'Recognized By Leading Design & Tech Media',
                'press' => [
                    ['name' => 'WIRED', 'quote' => 'A rare blend of industrial rigor and supreme acoustic joy.'],
                    ['name' => 'WALLPAPER*', 'quote' => 'Redefining contemporary desk ergonomics and modern craft.'],
                    ['name' => 'HYPEBEAST', 'quote' => 'The new golden standard for minimalist streetwear essentials.'],
                    ['name' => 'GQ', 'quote' => 'Materials that compete effortlessly with four-figure luxury staples.'],
                ],
                'eyebrow' => 'Real Community Feedback',
                'title' => 'Loved by 24,000+ Collectors',
                'description' => 'Hear from creators, architects, and audiophiles who built their spaces with Aura.',
                'items' => [
                    ['author' => 'Elena Rostova', 'role' => 'Senior Product Designer', 'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'rating' => 5, 'content' => 'The Aura Horizon headphones replaced everything else I owned. The materials feel like a piece of bespoke architecture, and the soundstage is sublime.', 'verified' => true],
                    ['author' => 'Marcus Vance', 'role' => 'Architect & Creative Director', 'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'rating' => 5, 'content' => 'Rarely do you find a store where every single product matches the photos down to the micrometer. The Titanium Chronograph feels like a four-figure Swiss piece.', 'verified' => true],
                    ['author' => 'Sophia Chen', 'role' => 'Tech Lead & Remote Founder', 'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', 'rating' => 5, 'content' => 'The Sculpt desk lamp transformed my workspace completely. Natural warm light that keeps my eyes refreshed during 10-hour coding sprints. Fast delivery too!', 'verified' => true],
                ],
            ],
            'newsletter' => [
                'enabled' => true,
                'eyebrow' => 'Aura Collective VIP',
                'title' => 'Receive $20 Toward Your Next Order',
                'description' => 'Subscribe to unlock secret seasonal drops, bespoke invites, and curated design essays before the general public.',
                'placeholder' => 'Enter your email address...',
                'button_label' => 'Join Free',
                'success_message' => 'Welcome to the club! Check your inbox for your welcome gift.',
                'perks' => ['No spam ever', 'Instant $20 voucher', 'Unsubscribe in 1-click'],
            ],
            'footer' => [
                'about' => 'An independent industrial design studio and lifestyle brand crafting refined acoustic hardware, architectural desk tools, and sustainable everyday apparel.',
                'socials' => [
                    ['platform' => 'twitter', 'url' => 'https://twitter.com'],
                    ['platform' => 'instagram', 'url' => 'https://instagram.com'],
                    ['platform' => 'youtube', 'url' => 'https://youtube.com'],
                ],
                'columns' => [
                    [
                        'title' => 'Shop',
                        'links' => [
                            ['label' => 'All Products', 'url' => '/shop'],
                            ['label' => 'New Arrivals', 'url' => '/shop?sort=newest'],
                            ['label' => 'Best Sellers', 'url' => '/shop?sort=popular'],
                            ['label' => 'Flash Deals', 'url' => '/shop?on_sale=1'],
                        ],
                    ],
                    [
                        'title' => 'Client Concierge',
                        'links' => [
                            ['label' => 'Shipping & Returns', 'url' => '/pages/shipping-and-returns'],
                            ['label' => 'Warranty', 'url' => '/pages/warranty'],
                            ['label' => 'Contact Support', 'url' => '/pages/contact'],
                        ],
                    ],
                    [
                        'title' => 'The Atelier',
                        'links' => [
                            ['label' => 'About Us', 'url' => '/pages/about-us'],
                            ['label' => 'Journal & Stories', 'url' => '/pages/about-us'],
                        ],
                    ],
                ],
                'copyright' => 'Aura Atelier, Inc. All rights reserved.',
                'payment_badges' => ['VISA', 'MC', 'AMEX', 'PAYPAL', 'COD'],
                'legal_links' => [
                    ['label' => 'Privacy Policy', 'url' => '/pages/privacy-policy'],
                    ['label' => 'Terms of Service', 'url' => '/pages/terms-of-service'],
                ],
            ],
        ];
    }
}
