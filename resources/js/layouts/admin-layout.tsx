import { usePage } from '@inertiajs/react';
import * as React from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
};

/**
 * Modern Admin Layout
 *
 * Implements a modern administration console architecture:
 * - Persistent collapsible side navigation (`AdminSidebar`) with icon/expanded modes
 * - Sticky top app bar (`AdminHeader`) with command palette, breadcrumbs, notifications, and profile menu
 * - Responsive mobile drawer for seamless tablet & phone management
 * - Inset layout variant with polished glassmorphic styling
 */
export default function AdminLayout({ breadcrumbs = [], children }: Props) {
    const page = usePage();
    // Default open state read from Inertia shared props / cookies
    const defaultOpen = page.props.sidebarOpen ?? true;

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AdminSidebar />
            <SidebarInset className="min-w-0 flex-1 overflow-x-hidden bg-background">
                <AdminHeader breadcrumbs={breadcrumbs} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
