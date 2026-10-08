import { Head } from '@inertiajs/react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';
import type { DashboardInvitation } from '@/types';

/**
 * Props passed from Laravel's `DashboardController::__invoke()`
 *
 * In Inertia, props returned by `Inertia::render('dashboard', ['pendingInvitations' => ...])`
 * are automatically injected into this top-level component props.
 */
type Props = {
    pendingInvitations?: DashboardInvitation[];
};

/**
 * Dashboard Page Component
 *
 * Rendered when the user visits `/{current_team}/dashboard`.
 *
 * Key Concepts:
 * 1. Automatic Modal Trigger: If the backend returns pending invitations for other teams,
 *    `useState` initializes `showInvitations = true` to prompt the user to accept/decline.
 * 2. Inertia Page Layout Configuration: `Dashboard.layout` passes page-level metadata
 *    (like navigation breadcrumbs) up to the persistent layout shell (`AppLayout`).
 */
export default function Dashboard({ pendingInvitations = [] }: Props) {
    // Show the invitations dialog automatically if the user has pending invitations
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );

    return (
        <>
            {/* Updates browser tab to "Dashboard - Laravel" */}
            <Head title="Dashboard" />

            {/* Modal displaying invitations to join other teams */}
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />

            {/* Main Dashboard Layout Grid */}
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* 3-column metric cards row */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>

                {/* Large content/chart section */}
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </>
    );
}

/**
 * Layout Props Function
 *
 * Configures navigation breadcrumbs for this specific page, consumed by `AppLayout`.
 * Uses Wayfinder route helper `dashboard(props.currentTeam.slug)` to generate URLs safely.
 */
Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});

