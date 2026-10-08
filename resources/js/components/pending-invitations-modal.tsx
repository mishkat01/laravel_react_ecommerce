/**
 * PendingInvitationsModal Component
 *
 * Demonstrates:
 * 1. Granular loading state: `processingCode` tracks which specific invitation is being
 *    accepted/declined so other list items remain interactive without UI jitter.
 * 2. Wayfinder controller actions: `TeamInvitationController.accept()` and `decline()`.
 * 3. Smart dialog closure: automatically closing the modal when the last pending invitation
 *    in the list is resolved.
 */

import { router } from '@inertiajs/react';
import { useState } from 'react';
import TeamInvitationController from '@/actions/App/Http/Controllers/Teams/TeamInvitationController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { DashboardInvitation } from '@/types';

type Props = {
    /** List of pending team invitations received by the authenticated user */
    invitations: DashboardInvitation[];
    /** Controlled modal visibility state */
    open: boolean;
    /** Modal visibility toggle callback */
    onOpenChange: (open: boolean) => void;
};

/**
 * Modal dialog displaying all outstanding team invitations for the user,
 * allowing one-click Accept or Decline.
 */
export default function PendingInvitationsModal({
    invitations,
    open,
    onOpenChange,
}: Props) {
    // Tracks the specific invitation code currently in-flight
    const [processingCode, setProcessingCode] = useState<string | null>(null);

    /**
     * Accepts the selected team invitation.
     */
    const acceptInvitation = (invitation: DashboardInvitation) => {
        router.visit(TeamInvitationController.accept(invitation), {
            onStart: () => setProcessingCode(invitation.code),
            onFinish: () => setProcessingCode(null),
        });
    };

    /**
     * Declines the selected team invitation.
     */
    const declineInvitation = (invitation: DashboardInvitation) => {
        router.visit(TeamInvitationController.decline(invitation), {
            onStart: () => setProcessingCode(invitation.code),
            onFinish: () => setProcessingCode(null),
            onSuccess: () => {
                // If this was the last remaining invitation, close the modal automatically
                if (invitations.length === 1) {
                    onOpenChange(false);
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent data-test="pending-invitations-modal">
                <DialogHeader>
                    <DialogTitle>Pending team invitations</DialogTitle>
                    <DialogDescription>
                        Accept or decline the teams you have been invited to
                        join.
                    </DialogDescription>
                </DialogHeader>

                {/* List of Pending Invitations */}
                <div className="grid gap-4">
                    {invitations.map((invitation) => (
                        <div
                            key={invitation.code}
                            data-test="pending-invitation-row"
                            className="rounded-lg border p-4"
                        >
                            <div className="space-y-1">
                                <p className="font-medium">
                                    {invitation.team.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {invitation.inviterName} invited you to join
                                    this team.
                                </p>
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                {/* Decline Button */}
                                <Button
                                    variant="secondary"
                                    data-test="pending-invitation-decline"
                                    disabled={
                                        processingCode === invitation.code
                                    }
                                    onClick={() =>
                                        declineInvitation(invitation)
                                    }
                                >
                                    Decline
                                </Button>

                                {/* Accept Button */}
                                <Button
                                    data-test="pending-invitation-accept"
                                    disabled={
                                        processingCode === invitation.code
                                    }
                                    onClick={() => acceptInvitation(invitation)}
                                >
                                    Accept
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

