import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

/**
 * AppSidebarLayout
 *
 * Implements a collapsible sidebar navigation architecture:
 * - `<AppShell variant="sidebar">`: Context provider managing responsive sidebar expand/collapse state.
 * - `<AppSidebar />`: Nav items, user profile popover, and team switcher.
 * - `<AppContent>`: Main content area containing `<AppSidebarHeader>` (breadcrumbs) and the page `{children}`.
 */
export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}

