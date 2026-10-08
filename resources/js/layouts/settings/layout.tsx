import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { index as teams } from '@/routes/teams';
import type { NavItem } from '@/types';

/**
 * Settings Navigation Links Configuration
 *
 * Uses type-safe Wayfinder route functions (`edit()`, `editSecurity()`, etc.)
 * to reference Laravel routes without hardcoding URL strings.
 */
const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Teams',
        href: teams(),
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
    },
];

/**
 * SettingsLayout Component
 *
 * A nested layout shared across all `/settings/*` pages:
 * - Profile (`settings/profile`)
 * - Security (`settings/security`)
 * - Teams (`settings/teams`)
 * - Appearance (`settings/appearance`)
 *
 * Key React + Inertia Concepts:
 * 1. Nested Layout: In `app.tsx`, pages starting with `settings/` use `[AppLayout, SettingsLayout]`.
 * 2. Active Tab Detection: `useCurrentUrl().isCurrentOrParentUrl(href)` dynamically highlights the active nav button.
 * 3. Client-Side Navigation: `<Button asChild><Link href={...}>` renders an Inertia SPA link
 *    styled with shadcn button utilities.
 */
export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-6">
            {/* Common Settings Header */}
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                {/* Secondary navigation sidebar */}
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted font-medium': isCurrentOrParentUrl(item.href),
                                })}
                            >
                                {/* Inertia Link prevents page reloads and swaps page props via AJAX */}
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                {/* Sub-page content rendered here */}
                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}

