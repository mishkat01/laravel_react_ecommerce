import { CheckCircle2, Quote, Star } from 'lucide-react';
import { TESTIMONIALS } from './data';

const PRESS = [
    { name: 'WIRED', quote: '“A rare blend of industrial rigor and supreme acoustic joy.”' },
    { name: 'WALLPAPER*', quote: '“Redefining contemporary desk ergonomics and modern craft.”' },
    { name: 'HYPEBEAST', quote: '“The new golden standard for minimalist streetwear essentials.”' },
    { name: 'GQ', quote: '“Materials that compete effortlessly with four-figure luxury staples.”' },
];

export function LandingTestimonials() {
    return (
        <section id="story" className="py-20 border-t border-border/50 bg-muted/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Press Quotes Ticker / Grid */}
                <div className="mb-16">
                    <div className="text-center mb-6">
                        <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                            Recognized By Leading Design &amp; Tech Media
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {PRESS.map((item) => (
                            <div
                                key={item.name}
                                className="flex flex-col items-center text-center p-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-2xs"
                            >
                                <span className="font-mono font-black text-sm sm:text-base tracking-widest text-foreground">
                                    {item.name}
                                </span>
                                <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">
                                    {item.quote}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <div className="text-xs font-bold tracking-widest text-primary uppercase">
                        Real Community Feedback
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mt-1 text-foreground">
                        Loved by 24,000+ Collectors
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Hear from creators, architects, and audiophiles who built their spaces with Aura.
                    </p>
                </div>

                {/* Testimonial Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((test) => (
                        <div
                            key={test.id}
                            className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-6 shadow-xs transition-all hover:shadow-lg hover:border-primary/30"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex text-amber-400">
                                        {[...Array(test.rating)].map((_, i) => (
                                            <Star key={i} className="size-4 fill-current" />
                                        ))}
                                    </div>
                                    <Quote className="size-5 text-muted-foreground/30" />
                                </div>

                                <p className="text-sm text-foreground/90 leading-relaxed">
                                    &ldquo;{test.content}&rdquo;
                                </p>
                            </div>

                            <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={test.avatar}
                                        alt={test.author}
                                        className="size-10 rounded-full object-cover border border-border"
                                    />
                                    <div>
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                                            <span>{test.author}</span>
                                            {test.verified && (
                                                <CheckCircle2 className="size-3 text-emerald-500" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            {test.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
