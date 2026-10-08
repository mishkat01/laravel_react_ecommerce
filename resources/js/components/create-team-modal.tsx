/**
 * CreateTeamModal Component
 *
 * Demonstrates essential Laravel + React patterns:
 * 1. Radix UI Dialog with `asChild` trigger delegation.
 * 2. Inertia v3 `<Form>` integrating with Wayfinder route helpers (`store.form()`).
 * 3. React Key Trick: `key={String(open)}` forces unmounting/remounting of the Form
 *    whenever the dialog closes, ensuring clean state without lingering validation errors.
 * 4. Automatic error extraction from Laravel's FormRequest / Validator response.
 */

import { Form } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/teams';

/**
 * Renders a modal dialog allowing authenticated users to create a new team workspace.
 *
 * @param children - The trigger element (e.g., a button or dropdown item) rendered via `asChild`.
 */
export default function CreateTeamModal({ children }: PropsWithChildren) {
    // Local modal visibility state controlling Radix Dialog
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* asChild passes click handlers and accessibility attributes directly to children */}
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                {/*
                  Inertia v3 <Form> Component:
                  - `key={String(open)}`: Resets the form inputs and errors when modal opens.
                  - `{...store.form()}`: Automatically injects action="/teams" and method="POST".
                  - `onSuccess`: Callback fired when Laravel returns a successful redirect / 200 response.
                */}
                <Form
                    key={String(open)}
                    {...store.form()}
                    className="space-y-6"
                    onSuccess={() => setOpen(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Create a new team</DialogTitle>
                                <DialogDescription>
                                    Create a new team to collaborate with
                                    others.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Form Input Group */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Team name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    data-test="create-team-name"
                                    placeholder="My team"
                                    required
                                />
                                {/* Displays Laravel backend validation error ($errors->get('name')) */}
                                <InputError message={errors.name} />
                            </div>

                            {/* Action Buttons */}
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>

                                {/* Disabled while Inertia request is in-flight (processing === true) */}
                                <Button
                                    type="submit"
                                    data-test="create-team-submit"
                                    disabled={processing}
                                >
                                    Create team
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

