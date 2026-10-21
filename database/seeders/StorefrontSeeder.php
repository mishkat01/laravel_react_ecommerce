<?php

namespace Database\Seeders;

use App\Enums\CouponType;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Page;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Services\StorefrontSettings;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a demo catalog (categories → subcategories → products), customer reviews,
 * coupons, content pages, and storefront settings matching the original landing page.
 */
class StorefrontSeeder extends Seeder
{
    /**
     * Unsplash image helper.
     */
    private function image(string $id, int $width = 900): string
    {
        return "https://images.unsplash.com/{$id}?auto=format&fit=crop&w={$width}&q=80";
    }

    /**
     * Run the database seeds.
     */
    public function run(StorefrontSettings $settings): void
    {
        $catalog = [
            'audio-tech' => [
                'name' => 'Acoustics & Audio',
                'description' => 'Immersive soundscapes & noise cancellation engineered for purists.',
                'image' => $this->image('photo-1546435770-a3e426bf472b', 800),
                'subcategories' => ['Headphones', 'Speakers'],
            ],
            'workspace' => [
                'name' => 'Ergonomic Workspace',
                'description' => 'Architectural desk lamps, mechanical keyboards, and precision tools.',
                'image' => $this->image('photo-1527864550417-7fd91fc51a46', 800),
                'subcategories' => ['Lighting', 'Keyboards', 'Charging'],
            ],
            'apparel' => [
                'name' => 'Minimalist Apparel',
                'description' => 'Ultra-heavyweight French terry cotton & sustainably sourced weaves.',
                'image' => $this->image('photo-1556905055-8f358a7a47b2', 800),
                'subcategories' => ['Hoodies & Sweats', 'Trousers'],
            ],
            'accessories' => [
                'name' => 'Craft Accessories',
                'description' => 'Titanium timepieces, full-grain leather goods, and RFID wallets.',
                'image' => $this->image('photo-1523275335684-37898b6baf30', 800),
                'subcategories' => ['Watches', 'Bags', 'Wallets'],
            ],
            'home-living' => [
                'name' => 'Modern Living',
                'description' => 'Stoneware ceramics, ambient lighting, and artisanal soy candles.',
                'image' => $this->image('photo-1513519245088-0e12902e5a38', 800),
                'subcategories' => ['Tableware', 'Candles & Scents'],
            ],
        ];

        $subcategories = [];

        foreach (array_keys($catalog) as $index => $slug) {
            $category = Category::create([
                'name' => $catalog[$slug]['name'],
                'slug' => $slug,
                'description' => $catalog[$slug]['description'],
                'image' => $catalog[$slug]['image'],
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => $index,
            ]);

            foreach ($catalog[$slug]['subcategories'] as $position => $name) {
                $subcategories[$name] = $category->subcategories()->create([
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'sort_order' => $position,
                ]);
            }
        }

        $products = collect($this->products())->map(function (array $data, int $index) use ($subcategories) {
            $subcategory = $subcategories[$data['subcategory']];

            return Product::create([
                ...collect($data)->except('subcategory')->all(),
                'category_id' => $subcategory->category_id,
                'subcategory_id' => $subcategory->id,
                'slug' => Str::slug($data['name']),
                'sku' => 'AUR-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'is_active' => true,
                'sort_order' => $index,
            ]);
        });

        $this->seedReviews($products->all());

        Coupon::create(['code' => 'ELEVATE20', 'type' => CouponType::Percent, 'value' => 20, 'is_active' => true]);
        Coupon::create(['code' => 'WELCOME10', 'type' => CouponType::Fixed, 'value' => 10, 'min_subtotal' => 50, 'is_active' => true]);

        foreach ($this->pages() as $title => $content) {
            Page::create(['title' => $title, 'slug' => Str::slug($title), 'content' => $content, 'is_published' => true]);
        }

        $settings->update('hero', [
            ...StorefrontSettings::defaults()['hero'],
            'product_id' => $products->first()->id,
        ]);

        $settings->update('deal', [
            ...StorefrontSettings::defaults()['deal'],
            'ends_at' => now()->addDays(3)->toIso8601String(),
        ]);
    }

    /**
     * Seed a handful of reviews per product from demo customers and sync product ratings.
     *
     * @param  array<int, Product>  $products
     */
    private function seedReviews(array $products): void
    {
        $customers = User::factory()->count(6)->create();

        $comments = [
            [5, 'Exceeded expectations', 'Build quality is outstanding and it looks even better in person. Would happily buy again.'],
            [5, 'Worth every penny', 'Arrived quickly, beautifully packaged, and it has become part of my daily routine.'],
            [4, 'Great, with a small nitpick', 'Excellent materials and finish. I wish there were a few more color options.'],
            [5, 'A design classic', 'Minimal, functional, and clearly made to last. Customer support was great too.'],
            [4, 'Solid purchase', 'Does exactly what it promises. Shipping took a day longer than expected.'],
        ];

        foreach ($products as $index => $product) {
            foreach ($customers->take(3 + $index % 3) as $offset => $customer) {
                [$rating, $title, $body] = $comments[($index + $offset) % count($comments)];

                Review::create([
                    'product_id' => $product->id,
                    'user_id' => $customer->id,
                    'rating' => $rating,
                    'title' => $title,
                    'body' => $body,
                    'is_verified' => $offset % 2 === 0,
                ]);
            }

            $product->refreshRating();
        }
    }

    /**
     * The demo catalog.
     *
     * @return list<array<string, mixed>>
     */
    private function products(): array
    {
        return [
            [
                'subcategory' => 'Headphones', 'brand' => 'Aura', 'is_featured' => true, 'badge' => 'Bestseller', 'stock_quantity' => 42,
                'name' => 'Aura Horizon ANC Headphones', 'short_description' => 'Bespoke 40mm Beryllium Drivers', 'price' => 299, 'compare_price' => 350,
                'description' => 'Engineered with hybrid active noise cancellation, lossless Bluetooth 5.3, memory foam lambskin pads, and an exceptional 38-hour battery reserve.',
                'images' => [$this->image('photo-1505740420928-5e560c06d30e'), $this->image('photo-1546435770-a3e426bf472b'), $this->image('photo-1484704849700-f032a568e944')],
                'colors' => [['name' => 'Matte Obsidian', 'hex' => '#1C1917'], ['name' => 'Lunar Silver', 'hex' => '#D6D3D1'], ['name' => 'Champagne Sand', 'hex' => '#E7E5E4']],
                'features' => ['Hybrid Active Noise Cancellation (up to -42dB)', 'Ultra-low latency wireless + lossless USB-C audio', '38-Hour Battery with Fast Charge (10 min = 5 hours)', 'Customizable EQ profiles via companion mobile app'],
            ],
            [
                'subcategory' => 'Watches', 'brand' => 'Chrono Works', 'is_featured' => true, 'badge' => 'New Season', 'stock_quantity' => 18,
                'name' => 'Titanium Chrono Timepiece', 'short_description' => 'Swiss Movement & Sapphire Glass', 'price' => 219, 'compare_price' => 280,
                'description' => 'A minimalist automatic chronograph sculpted from aerospace-grade Grade 5 titanium, complemented by scratch-proof sapphire crystal and interchangeable straps.',
                'images' => [$this->image('photo-1523275335684-37898b6baf30'), $this->image('photo-1522335789203-aabd1fc54bc9')],
                'colors' => [['name' => 'Brushed Titanium', 'hex' => '#78716C'], ['name' => 'Stealth Black', 'hex' => '#09090B'], ['name' => 'Olive Green', 'hex' => '#3F4F38']],
                'features' => ['Grade 5 Aerospace Titanium case (40mm)', 'Swiss Sellita automatic movement', 'Double-domed anti-reflective sapphire crystal', 'Water resistant to 10 ATM (100 meters)'],
            ],
            [
                'subcategory' => 'Lighting', 'brand' => 'Sculpt', 'is_featured' => true, 'badge' => 'Editor Choice', 'stock_quantity' => 25,
                'name' => 'Sculpt Architectural Desk Lamp', 'short_description' => 'Touch Dimming & Qi Wireless Pad', 'price' => 145, 'compare_price' => null,
                'description' => 'Precision-machined aircraft aluminum with balanced counterweights. Seamless capacitive touch slider with circadian rhythm warm-to-cool tuning.',
                'images' => [$this->image('photo-1507473885765-e6ed057f782c'), $this->image('photo-1513506003901-1e6a229e2d15')],
                'colors' => [['name' => 'Carbon Black', 'hex' => '#18181B'], ['name' => 'Warm White', 'hex' => '#F4F4F5']],
                'features' => ['High CRI >98 natural light spectrum', 'Built-in 15W Qi fast wireless charging base', '360° frictionless fluid ball-joint movement', 'Auto-dimming ambient light sensor'],
            ],
            [
                'subcategory' => 'Keyboards', 'brand' => 'Kevlar Labs', 'is_featured' => true, 'badge' => 'Popular', 'stock_quantity' => 3,
                'name' => 'Kevlar Pro Mechanical Keyboard', 'short_description' => 'Hot-Swap & Gasket Mount System', 'price' => 165, 'compare_price' => 195,
                'description' => 'A 75% compact mechanical masterpiece featuring lubed tactile switches, sound-absorbing Poron gaskets, and CNC anodized aluminum chassis.',
                'images' => [$this->image('photo-1587829741301-dc798b83add3'), $this->image('photo-1618384887929-16ec33fab9ef')],
                'colors' => [['name' => 'Slate Gray', 'hex' => '#475569'], ['name' => 'Nordic White', 'hex' => '#E2E8F0'], ['name' => 'Cyberpunk Violet', 'hex' => '#4C1D95']],
                'features' => ['Factory-lubed Gateron Oil King linear switches', 'Tri-mode: Bluetooth 5.2, 2.4GHz low-lag, USB-C', '4000mAh battery for up to 200 hours of typing', 'Mac & Windows dual layout switchable'],
            ],
            [
                'subcategory' => 'Hoodies & Sweats', 'brand' => 'Loopback', 'is_featured' => false, 'badge' => null, 'stock_quantity' => 60,
                'name' => 'Heavyweight Loopback Hoodie', 'short_description' => '480 GSM French Terry Cotton', 'price' => 98, 'compare_price' => 125,
                'description' => 'Custom knitted heavyweight organic cotton with a tailored oversized drape, double-layered hood without drawstrings, and rib-knit cuffs.',
                'images' => [$this->image('photo-1556905055-8f358a7a47b2'), $this->image('photo-1509967419530-da38b4704bc6')],
                'colors' => [['name' => 'Oatmeal Heather', 'hex' => '#E6E4DE'], ['name' => 'Washed Charcoal', 'hex' => '#333333'], ['name' => 'Sage Leaf', 'hex' => '#7D8C7C']],
                'features' => ['100% GOTS certified organic Aegean cotton', 'Pre-shrunk vintage enzyme wash', 'Clean blind stitching & reinforced seams', 'Sustainably dyed with zero toxic chemicals'],
            ],
            [
                'subcategory' => 'Bags', 'brand' => 'Tuscan Goods', 'is_featured' => true, 'badge' => 'Bestseller', 'stock_quantity' => 12,
                'name' => 'Full-Grain Commuter Backpack', 'short_description' => 'Tuscan Leather & 16" Laptop Pocket', 'price' => 245, 'compare_price' => 290,
                'description' => 'Handmade vegetable-tanned leather bag built to endure decades of city travel. Features water-resistant canvas lining and discreet passport pocket.',
                'images' => [$this->image('photo-1553062407-98eeb64c6a62'), $this->image('photo-1548036328-c9fa89d128fa')],
                'colors' => [['name' => 'Cognac Saddle', 'hex' => '#8B4513'], ['name' => 'Matte Onyx', 'hex' => '#1C1917']],
                'features' => ['Full-grain Tuscan vegetable-tanned leather', 'Padded sleeve fits up to 16" MacBook Pro', 'Weatherproof YKK Excella zippers', 'Ergonomic breathable back panel padding'],
            ],
            [
                'subcategory' => 'Tableware', 'brand' => 'Clayform', 'is_featured' => false, 'badge' => 'Handmade', 'stock_quantity' => 30,
                'name' => 'Ceramic Stoneware Pourer & Cup Set', 'short_description' => 'Hand-Thrown Speckled Glaze', 'price' => 64, 'compare_price' => null,
                'description' => 'Artisanal coffee and tea serving kit crafted in small batches by master potters. Raw unglazed terracotta base meets velvety matte white top.',
                'images' => [$this->image('photo-1514432324607-a09d9b4aefdd')],
                'colors' => [['name' => 'Raw Sand', 'hex' => '#D7C4B7'], ['name' => 'Basalt Charcoal', 'hex' => '#374151']],
                'features' => ['High-fire durable stoneware ceramic', 'Dishwasher and microwave safe', 'Ergonomic heat-dissipating spout design', 'Includes matching 320ml barista cup'],
            ],
            [
                'subcategory' => 'Speakers', 'brand' => 'Aura', 'is_featured' => true, 'badge' => 'Trending', 'stock_quantity' => 34,
                'name' => 'Aura Studio Pebble 360 Speaker', 'short_description' => '360° Omnidirectional Acoustic Sound', 'price' => 139, 'compare_price' => 169,
                'description' => 'A compact acoustic sphere with tactile milled-aluminum rotary volume ring, IP67 dust/waterproof rating, and multi-room stereo pairing.',
                'images' => [$this->image('photo-1608043152269-423dbba4e7e1'), $this->image('photo-1545454675-3531b543be5d')],
                'colors' => [['name' => 'Forest Moss', 'hex' => '#2D372E'], ['name' => 'Sandstone Grey', 'hex' => '#CBD5E1'], ['name' => 'Terracotta Coral', 'hex' => '#B45309']],
                'features' => ['Custom 45mm neodymium driver + passive sub', 'TrueWireless stereo pairing with 2nd unit', '22-Hour non-stop battery life', 'Integrated lanyard ring for portability'],
            ],
            [
                'subcategory' => 'Candles & Scents', 'brand' => 'Hinoki', 'is_featured' => false, 'badge' => 'Clean Fragrance', 'stock_quantity' => 80,
                'name' => 'Hinoki & Smoked Wood Soy Candle', 'short_description' => '100% Botanical Wax & Wood Wick', 'price' => 38, 'compare_price' => null,
                'description' => 'Poured into mouth-blown amber glass with an aromatic profile of Japanese cedar, charred birch, and crisp citrus bergamot. Burns clean for 65 hours.',
                'images' => [$this->image('photo-1603006905003-be475563bc59')],
                'colors' => [['name' => 'Amber Glow', 'hex' => '#B45309'], ['name' => 'Frosted Smoke', 'hex' => '#4B5563']],
                'features' => ['Non-toxic pure renewable soy wax', 'FSC-certified crackling wooden wick', 'Phthalate-free essential oil extracts', 'Hand-poured in reusable glassware'],
            ],
            [
                'subcategory' => 'Trousers', 'brand' => 'Everyday Co.', 'is_featured' => false, 'badge' => 'New', 'stock_quantity' => 45,
                'name' => 'Everyday Relaxed Chino Trousers', 'short_description' => 'High-Density Mercerized Twill', 'price' => 110, 'compare_price' => null,
                'description' => 'Tailored with a subtle taper, hidden elasticated comfort waistband, and deep slant pockets for effortless transitions between work and weekend.',
                'images' => [$this->image('photo-1479064555552-3ef4979f8908')],
                'colors' => [['name' => 'Desert Khaki', 'hex' => '#C2B280'], ['name' => 'Ink Navy', 'hex' => '#1E293B'], ['name' => 'Olive Drab', 'hex' => '#3B4D3C']],
                'features' => ['98% Organic Cotton, 2% Elastane for stretch', 'Corozo nut buttons & reinforced bar-tacks', 'Wrinkle-resistant fabric finish', 'Designed for everyday durability'],
            ],
            [
                'subcategory' => 'Charging', 'brand' => 'MagCharge', 'is_featured' => false, 'badge' => null, 'stock_quantity' => 0,
                'name' => 'MagCharge Dual Wireless Stand', 'short_description' => 'CNC Aluminum & Magnetic Alignment', 'price' => 89, 'compare_price' => 115,
                'description' => 'Elevate your nightstand or desk. Fast-charges iPhone and AirPods simultaneously with weighted silicone grip footing so it stays put.',
                'images' => [$this->image('photo-1622445262464-84b14e0745b1')],
                'colors' => [['name' => 'Space Grey', 'hex' => '#374151'], ['name' => 'Silver Matte', 'hex' => '#E5E7EB']],
                'features' => ['15W Qi2 certified magnetic fast charging', 'Dual device simultaneous output', 'Weighted anti-slip base with cable routing', 'LED indicator with auto-sleep sensor'],
            ],
            [
                'subcategory' => 'Wallets', 'brand' => 'Tuscan Goods', 'is_featured' => false, 'badge' => 'Essential', 'stock_quantity' => 70,
                'name' => 'Slim MagSafe Bifold Wallet', 'short_description' => 'RFID Protection & Tuscan Leather', 'price' => 58, 'compare_price' => 75,
                'description' => 'Holds up to 8 cards and folded cash in an ultra-compact silhouette. Features quick thumb-swipe slot and internal RFID blocking foil.',
                'images' => [$this->image('photo-1627123424574-724758594e93')],
                'colors' => [['name' => 'Caramel Tan', 'hex' => '#A16207'], ['name' => 'Midnight Blue', 'hex' => '#1E3A8A'], ['name' => 'Obsidian Black', 'hex' => '#0F172A']],
                'features' => ['Integrated high-strength MagSafe magnets', 'Holds 8 cards + 6 folded bills', 'Military-grade RFID radiation shield', 'Guaranteed patina with age'],
            ],
        ];
    }

    /**
     * Content pages linked from the footer, written in Markdown.
     *
     * @return array<string, string>
     */
    private function pages(): array
    {
        return [
            'About Us' => "## An independent design studio\n\nAura Atelier crafts refined acoustic hardware, architectural desk tools, and sustainable everyday apparel. Every product is developed in small batches with partners we visit in person.\n\n### What we believe\n\n- **Fewer, better things.** We design for decades, not seasons.\n- **Honest materials.** Titanium, full-grain leather, organic cotton.\n- **Carbon-neutral by design.** Plastic-free packaging and offset freight.",
            'Shipping and Returns' => "## Shipping\n\nOrders ship within 1–2 business days. Standard shipping is free on orders over the free-shipping threshold shown in your cart.\n\n## Returns\n\nNot in love? Return any unused item within **30 days** for a full refund. Contact support with your order number and we will email a prepaid label.",
            'Warranty' => "## 2-year craftsmanship guarantee\n\nAll hardware is covered against manufacturing defects for two years from delivery. Contact support with your order number and a short description of the issue.",
            'Contact' => "## We're here to help\n\nEmail **support@aura-atelier.test** and we will reply within one business day.\n\nPlease include your order number (for example `ORD-261021-ABC123`) so we can find your order quickly.",
            'Privacy Policy' => "## Privacy Policy\n\nWe collect the information you provide at checkout (name, email, phone, and shipping address) solely to fulfil and support your orders. We never sell your personal data.\n\nYou may request a copy or deletion of your data at any time by contacting support.",
            'Terms of Service' => "## Terms of Service\n\nBy placing an order you agree to pay the total shown at checkout. Prices and availability may change without notice. Orders may be cancelled if an item becomes unavailable, in which case you will not be charged.",
        ];
    }
}
