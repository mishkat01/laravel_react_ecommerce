import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * InputError Component
 *
 * Renders server-side validation error messages returned from Laravel:
 * - In Laravel, failed validation (`$request->validate()` or FormRequests) redirects back
 *   with an error bag.
 * - Inertia automatically extracts this into `errors[fieldName]`.
 * - If `message` is present, renders a styled red error message; otherwise renders nothing (`null`).
 */
export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p
            {...props}
            className={cn('text-sm text-red-600 dark:text-red-400', className)}
        >
            {message}
        </p>
    ) : null;
}

