import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from './data';

interface LandingCategoriesProps {
    onSelectCategory: (categorySlug: string) => void;
}

export function LandingCategories({ onSelectCategory }: LandingCategoriesProps) {
    const handleCategoryClick = (slug: string) => {
        onSelectCategory(slug);
        const el = document.getElementById('products');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="categories" className="py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
                    <div>
                        <div className="text-xs font-bold tracking-widest text-primary uppercase">
                            Curated Portfolios
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mt-1 text-foreground">
                            Explore By Category
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md">
                        Every product is thoughtfully developed with uncompromising precision, minimalist aesthetics, and sustainable engineering.
                    </p>
                </div>

                {/* Categories Grid: First 2 large, next 3 grid */}
                <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
                    {CATEGORIES.map((cat, idx) => {
                        // Create a balanced layout: first 2 take 6 cols each, next 3 take 4 cols each
                        const colSpan =
                            idx < 2
                                ? 'md:col-span-3 lg:col-span-6 h-[340px]'
                                : 'md:col-span-2 lg:col-span-4 h-[300px]';

                        return (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.slug)}
                                className={`group relative overflow-hidden rounded-3xl border border-border/70 bg-card cursor-pointer shadow-xs transition-all hover:shadow-xl hover:border-primary/50 ${colSpan}`}
                            >
                                {/* Background Image */}
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-opacity group-hover:opacity-95" />

                                {/* Card Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                                    <div className="flex justify-between items-start">
                                        <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur-md">
                                            {cat.itemCount} Items
                                        </span>
                                        <div className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all group-hover:bg-white group-hover:text-neutral-900 group-hover:scale-110">
                                            <ArrowUpRight className="size-4" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
                                            {cat.name}
                                        </h3>
                                        <p className="text-xs text-white/80 line-clamp-2 max-w-sm">
                                            {cat.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
