import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

/**
 * AppLayout
 *
 * The primary authenticated layout wrapper for the application.
 *
 * In an Inertia SPA:
 * - Persistent layouts prevent remounting when navigating between pages (e.g. Dashboard -> Settings).
 * - State inside the sidebar, header, and search bar remains intact between route transitions.
 * - Receives `breadcrumbs` and `children` (the specific page component being viewed).
 */
export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}

