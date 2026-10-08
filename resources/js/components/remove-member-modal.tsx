/**
 * RemoveMemberModal Component
 *
 * Demonstrates:
 * 1. Multi-parameter route handling: Passing route tuples `[team.slug, member.id]`
 *    to Wayfinder helper `destroyMember` (targeting DELETE `/teams/{team:slug}/members/{member:id}`).
 * 2. Programmatic `router.visit()` for item deletions from list/table UIs.
 * 3. Loading state indicators during network operations.
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
import { destroy as destroyMember } from '@/routes/teams/members';
import type { Team, TeamMember } from '@/types';

type Props = {
    /** The team from which the member is being expelled */
    team: Team;
    /** The member targeted for removal (or null if closed) */
    member: TeamMember | null;
    /** Modal open state */
    open: boolean;
    /** Open state change callback */
    onOpenChange: (open: boolean) => void;
};

/**
 * Modal dialog allowing team owners/admins to remove a member from the team.
 */
export default function RemoveMemberModal({
    team,
    member,
    open,
    onOpenChange,
}: Props) {
    // Local loading state while removal request executes
    const [processing, setProcessing] = useState(false);

    /**
     * Executes the member removal request via Inertia router.
     */
    const removeMember = () => {
        if (!member) {
            return;
        }

        // destroyMember expects a 2-tuple: [teamSlug, memberId]
        router.visit(destroyMember([team.slug, member.id]), {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remove team member</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove{' '}
                        <strong>{member?.name}</strong> from this team?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="remove-member-confirm"
                        disabled={processing}
                        onClick={removeMember}
                    >
                        Remove member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

