/**
 * AppShell Component
 *
 * Demonstrates:
 * 1. Server-to-Client State Bridging: Reads `usePage().props.sidebarOpen`
 *    which was extracted from cookies in Laravel's `HandleInertiaRequests` middleware.
 * 2. Layout Variant Switching: Supports full sidebar layouts vs top-header only layouts.
 * 3. Context Provider Provisioning: Envelopes application pages with `SidebarProvider`.
 */

import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = {
    /** Page content or inner layout structure */
    children: ReactNode;
    /** Shell visual layout variant ('sidebar' or 'header') */
    variant?: AppVariant;
};

/**
 * Root layout shell establishing the base layout wrapper and sidebar context.
 */
export function AppShell({ children, variant = 'sidebar' }: Props) {
    // Read the server-persisted sidebar open state from cookies via Inertia shared props
    const isOpen = usePage().props.sidebarOpen;

    // Header layout variant (e.g. for marketing or wide dashboards without sidebars)
    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    // Default sidebar layout variant with initial collapsed/expanded state
    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}

