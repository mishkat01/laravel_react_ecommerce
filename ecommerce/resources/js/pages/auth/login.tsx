import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';
import type { TeamInvitationContext } from '@/types';

/**
 * Login Component Props
 * Injected by Laravel Fortify's `LoginViewResponse`.
 */
type Props = {
    status?: string;                         // Session flash status (e.g. "Your password has been reset")
    canResetPassword: boolean;              // Flag indicating if password reset route is enabled
    teamInvitation?: TeamInvitationContext | null; // Context if user arrived via invitation URL
};

/**
 * Login Page Component
 *
 * Demonstrates:
 * 1. **Inertia v3 `<Form>` Component**:
 *    Instead of manual `useForm` hooks, Inertia v3 provides `<Form {...store.form()}>`,
 *    which automatically connects HTML inputs by `name`, tracks submission `processing`,
 *    and maps backend validation `errors`!
 * 2. **Passkey Verification**: `<PasskeyVerify />` enables biometric WebAuthn logins.
 * 3. **Persistent Layout Properties**: `Login.layout = { title, description }` supplies
 *    card headers to the surrounding `AuthLayout`.
 */
export default function Login({
    status,
    canResetPassword,
    teamInvitation,
}: Props) {
    return (
        <>
            {/* Updates browser title to "Log in - Laravel" */}
            <Head title="Log in" />

            {/* If user clicked a team invitation link, display which team they are joining */}
            {teamInvitation && (
                <TeamInvitationAlert
                    invitation={teamInvitation}
                    action="Log in"
                />
            )}

            {/* WebAuthn / Passkey biometric login button */}
            <PasskeyVerify />

            {/*
                Inertia v3 Form:
                - `store.form()`: Wayfinder helper supplying HTTP POST action `/login`
                - `resetOnSuccess`: Clears sensitive password field after successful post
                - Render-prop provides `{ processing, errors }`
            */}
            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            {/* Email Field */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                {/* Renders Laravel validation error if email is invalid */}
                                <InputError message={errors.email} />
                            </div>

                            {/* Password Field */}
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* "Remember me" session cookie checkbox */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            {/* Submit Button with animated spinner while processing */}
                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {/* Sign up redirect with invitation code preserved */}
                        <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <TextLink
                                href={register({
                                    query: {
                                        invitation: teamInvitation?.code,
                                    },
                                })}
                                data-test="register-link"
                                tabIndex={5}
                            >
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {/* Flash status banner (e.g., password reset confirmation) */}
            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

/**
 * AuthLayout metadata configuration
 * Injected into `AuthLayout` via Inertia layout resolver in `resources/js/app.tsx`.
 */
Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};

