import { Github, Instagram, Twitter, Youtube } from 'lucide-react';

export function LandingFooter() {
    return (
        <footer className="border-t border-border bg-card/60 pt-16 pb-12 text-muted-foreground text-xs">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/60">
                    {/* Brand Info */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <span className="text-sm font-black">A</span>
                            </div>
                            <span className="text-lg font-black tracking-tight text-foreground">
                                AURA<span className="text-primary font-black">.</span>
                            </span>
                        </div>
                        <p className="text-xs leading-relaxed max-w-sm">
                            An independent industrial design studio and lifestyle brand crafting
                            refined acoustic hardware, architectural desk tools, and sustainable
                            everyday apparel.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <a
                                href="#"
                                className="size-8 rounded-lg border border-border flex items-center justify-center hover:text-foreground hover:border-primary/50 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="size-3.5" />
                            </a>
                            <a
                                href="#"
                                className="size-8 rounded-lg border border-border flex items-center justify-center hover:text-foreground hover:border-primary/50 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="size-3.5" />
                            </a>
                            <a
                                href="#"
                                className="size-8 rounded-lg border border-border flex items-center justify-center hover:text-foreground hover:border-primary/50 transition-colors"
                                aria-label="YouTube"
                            >
                                <Youtube className="size-3.5" />
                            </a>
                            <a
                                href="#"
                                className="size-8 rounded-lg border border-border flex items-center justify-center hover:text-foreground hover:border-primary/50 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="size-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Column 1: Shop */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                            Collections
                        </h4>
                        <ul className="space-y-2">
                            <li><a href="#products" className="hover:text-foreground transition-colors">Acoustics &amp; Audio</a></li>
                            <li><a href="#products" className="hover:text-foreground transition-colors">Ergonomic Workspace</a></li>
                            <li><a href="#products" className="hover:text-foreground transition-colors">Minimalist Apparel</a></li>
                            <li><a href="#products" className="hover:text-foreground transition-colors">Craft Accessories</a></li>
                            <li><a href="#products" className="hover:text-foreground transition-colors">Modern Living Objects</a></li>
                            <li><a href="#deals" className="text-rose-500 hover:text-rose-600 transition-colors font-medium">Limited Flash Drops</a></li>
                        </ul>
                    </div>

                    {/* Column 2: Client Concierge */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                            Client Concierge
                        </h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-foreground transition-colors">Order Tracking</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Doorstep Returns Portal</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Shipping &amp; Customs</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">2-Year Warranty Claim</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Repairs &amp; Recycling</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Contact Support</a></li>
                        </ul>
                    </div>

                    {/* Column 3: The Atelier */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                            The Atelier
                        </h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-foreground transition-colors">Design Manifesto</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Materials &amp; Sourcing</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Carbon Neutrality Audit</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Flagship Stores</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Journal &amp; Stories</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Careers &bull; We&apos;re hiring</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Payment badges */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-muted-foreground">
                        &copy; {new Date().getFullYear()} Aura Atelier, Inc. All rights reserved. Crafted for creators.
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="px-2 py-1 rounded bg-muted/60 font-mono font-bold">VISA</span>
                        <span className="px-2 py-1 rounded bg-muted/60 font-mono font-bold">MC</span>
                        <span className="px-2 py-1 rounded bg-muted/60 font-mono font-bold">AMEX</span>
                        <span className="px-2 py-1 rounded bg-muted/60 font-mono font-bold">APPLE PAY</span>
                        <span className="px-2 py-1 rounded bg-muted/60 font-mono font-bold">PAYPAL</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px]">
                        <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
