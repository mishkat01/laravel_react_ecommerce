/**
 * LeaveTeamModal Component
 *
 * Demonstrates:
 * 1. Programmatic Inertia Navigation: Using `router.visit()` instead of `<Form>`.
 *    When an action requires no input fields (just a state transition like "leave"),
 *    programmatic `router.visit` gives direct lifecycle hook control (`onStart`, `onFinish`, `onSuccess`).
 * 2. Manual processing state management using React's `useState`.
 * 3. Wayfinder route action invoker (`leaveTeamAction(team.slug)`).
 */

import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { leave as leaveTeamAction } from '@/routes/teams';
import type { Team } from '@/types';

type Props = {
    /** The team the user intends to leave */
    team: Team | null;
    /** Modal open state */
    open: boolean;
    /** Open state change callback */
    onOpenChange: (open: boolean) => void;
};

/**
 * Modal dialog for an authenticated user to leave a team membership.
 */
export default function LeaveTeamModal({ team, open, onOpenChange }: Props) {
    // Manually track in-flight network request status
    const [processing, setProcessing] = useState(false);

    /**
     * Executes the leave team action using Inertia's router.
     */
    const leaveTeam = () => {
        if (!team) {
            return;
        }

        // router.visit dispatches an Inertia AJAX request to the backend route
        router.visit(leaveTeamAction(team.slug), {
            // Fired as soon as the HTTP request is initiated
            onStart: () => setProcessing(true),
            // Fired when the request finishes (regardless of success or error)
            onFinish: () => setProcessing(false),
            // Fired only if the response is successful (e.g., HTTP 302 redirect)
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave team</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to leave{' '}
                        <strong>{team?.name}</strong>?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>

                    {/* Triggers router.visit with visual disabled state while in flight */}
                    <Button
                        variant="destructive"
                        data-test="leave-team-confirm"
                        disabled={processing}
                        onClick={leaveTeam}
                    >
                        Leave team
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

