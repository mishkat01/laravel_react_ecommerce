/**
 * AppSidebar Component
 *
 * Demonstrates:
 * 1. Multi-Tenant Route Scoping: Resolves `dashboardUrl` dynamically using the active team slug
 *    from `usePage().props.currentTeam`.
 * 2. Inertia Prefetching: `<Link prefetch>` primes the next page bundle and server response
 *    on mouse hover or link focus for instantaneous transitions.
 * 3. Composition of specialized sidebar blocks: `TeamSwitcher`, `NavMain`, `NavFooter`, and `NavUser`.
 */

import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

/**
 * Main application navigation sidebar with workspace switching and account menu.
 */
export function AppSidebar() {
    // Access global Inertia props provided by HandleInertiaRequests middleware
    const page = usePage();

    // Dynamically compute the current team dashboard URL (multi-tenant routing)
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';

    // Primary application navigation items
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
    ];

    // External documentation and source code links
    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Header: App Logo and Team Switcher */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            {/* prefetch attribute enables zero-latency route switching */}
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {/* Interactive multi-tenant team selector */}
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Content: Main Navigation Items */}
            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            {/* Footer: External Resources & Current User Profile Dropdown */}
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

