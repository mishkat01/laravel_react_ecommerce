/**
 * DeleteTeamModal Component
 *
 * Demonstrates:
 * 1. Destructive action confirmation UX: requires typing the exact team name
 *    before enabling the submission button (`canDeleteTeam`).
 * 2. Inertia v3 `<Form>` integrating with parametrized Wayfinder route helper:
 *    `destroy.form(team.slug)` generates `method="DELETE"` to `/teams/{team:slug}`.
 * 3. Modal lifecycle state synchronization: resetting input state on close.
 */

import { Form } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { destroy } from '@/routes/teams';
import type { Team } from '@/types';

type Props = {
    /** The team entity targeted for deletion */
    team: Team;
    /** Controlled modal open state */
    open: boolean;
    /** State callback to open/close the dialog */
    onOpenChange: (open: boolean) => void;
};

/**
 * Modal dialog for permanently deleting a team.
 * Enforces a confirmation guard to prevent accidental data loss.
 */
export default function DeleteTeamModal({ team, open, onOpenChange }: Props) {
    // Local state tracking the user's manual confirmation input
    const [confirmationName, setConfirmationName] = useState('');

    // Safety guard: only enable submission when the user types the exact team name
    const canDeleteTeam = confirmationName === team.name;

    /**
     * Intercepts dialog close/open events to wipe the typed confirmation text when closed.
     */
    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            setConfirmationName('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                {/*
                  Inertia v3 Form:
                  - Binds to Wayfinder `destroy.form(team.slug)`.
                  - Triggers HTTP DELETE `/teams/{slug}`.
                  - On success (HTTP 302 redirect from Laravel), closes the modal.
                */}
                <Form
                    key={String(open)}
                    {...destroy.form(team.slug)}
                    className="space-y-6"
                    onSuccess={() => handleOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Are you sure?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the team{' '}
                                    <strong>"{team.name}"</strong>.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Confirmation Input Field */}
                            <div className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmation-name">
                                        Type <strong>"{team.name}"</strong> to
                                        confirm
                                    </Label>
                                    <Input
                                        id="confirmation-name"
                                        name="name"
                                        data-test="delete-team-name"
                                        value={confirmationName}
                                        onChange={(event) =>
                                            setConfirmationName(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter team name"
                                        autoComplete="off"
                                    />
                                    {/* Displays server validation errors (e.g. if name doesn't match on backend) */}
                                    <InputError message={errors.name} />
                                </div>
                            </div>

                            {/* Dialog Actions */}
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>

                                {/* Disabled unless exact name typed AND request is not currently processing */}
                                <Button
                                    variant="destructive"
                                    type="submit"
                                    data-test="delete-team-confirm"
                                    disabled={!canDeleteTeam || processing}
                                >
                                    Delete team
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

