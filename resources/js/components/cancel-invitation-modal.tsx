/**
 * CancelInvitationModal Component
 *
 * Demonstrates:
 * 1. Invitation revocation workflow via Inertia `router.visit()`.
 * 2. Multi-segment URL generation with Wayfinder tuples: `[team.slug, invitation.code]`.
 * 3. Modal lifecycle control upon deletion success.
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
import { destroy as destroyInvitation } from '@/routes/teams/invitations';
import type { Team, TeamInvitation } from '@/types';

type Props = {
    /** The team that issued the invitation */
    team: Team;
    /** The invitation object to revoke (or null if closed) */
    invitation: TeamInvitation | null;
    /** Controlled open state of the dialog */
    open: boolean;
    /** Open state change callback */
    onOpenChange: (open: boolean) => void;
};

/**
 * Modal dialog for canceling an unaccepted team invitation.
 */
export default function CancelInvitationModal({
    team,
    invitation,
    open,
    onOpenChange,
}: Props) {
    // Tracks in-flight HTTP request status
    const [processing, setProcessing] = useState(false);

    /**
     * Sends a DELETE request to cancel the specified invitation.
     */
    const cancelInvitation = () => {
        if (!invitation) {
            return;
        }

        // destroyInvitation takes [teamSlug, invitationCode]
        router.visit(destroyInvitation([team.slug, invitation.code]), {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel invitation</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel the invitation for{' '}
                        <strong>{invitation?.email}</strong>?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Keep invitation</Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="cancel-invitation-confirm"
                        disabled={processing}
                        onClick={cancelInvitation}
                    >
                        Cancel invitation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

