/**
 * InviteMemberModal Component
 *
 * Demonstrates:
 * 1. Handling invitations via email with selectable authorization roles.
 * 2. Integrating Radix UI `<Select>` component inside an Inertia v3 `<Form>`.
 * 3. Dynamic role options passed down from Laravel controller (via TypeScript `RoleOption[]`).
 * 4. Error display for both `email` and `role` fields returned by Laravel validation.
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store as storeInvitation } from '@/routes/teams/invitations';
import type { RoleOption, Team } from '@/types';

type Props = {
    /** The target team to which a member is being invited */
    team: Team;
    /** Allowed roles received from backend (e.g., Member, Admin) */
    availableRoles: RoleOption[];
    /** Dialog open state */
    open: boolean;
    /** Open state change handler */
    onOpenChange: (open: boolean) => void;
};

/**
 * Modal dialog for inviting external users by email to join a team workspace.
 */
export default function InviteMemberModal({
    team,
    availableRoles,
    open,
    onOpenChange,
}: Props) {
    // Local state for the selected role in the Radix Select dropdown
    const [inviteRole, setInviteRole] = useState<RoleOption['value']>('member');

    /**
     * Resets the selected role back to default 'member' when the modal closes.
     */
    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            setInviteRole('member');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                {/*
                  Inertia v3 Form:
                  - Binds to Wayfinder `storeInvitation.form(team.slug)`.
                  - Posts form data (email, role) to POST `/teams/{team:slug}/invitations`.
                  - Closes modal on successful response.
                */}
                <Form
                    key={String(open)}
                    {...storeInvitation.form(team.slug)}
                    className="space-y-6"
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Invite a team member</DialogTitle>
                                <DialogDescription>
                                    Send an invitation to join this team.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4">
                                {/* Email Input */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        data-test="invite-email"
                                        placeholder="colleague@example.com"
                                        required
                                    />
                                    {/* Backend validation error for email (e.g., invalid email, user already a member) */}
                                    <InputError message={errors.email} />
                                </div>

                                {/* Role Selector */}
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        name="role"
                                        data-test="invite-role"
                                        value={inviteRole}
                                        onValueChange={(value) =>
                                            setInviteRole(
                                                value as RoleOption['value'],
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRoles.map((role) => (
                                                <SelectItem
                                                    key={role.value}
                                                    value={role.value}
                                                >
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {/* Backend validation error for role */}
                                    <InputError message={errors.role} />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    data-test="invite-submit"
                                    disabled={processing}
                                >
                                    Send invitation
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

