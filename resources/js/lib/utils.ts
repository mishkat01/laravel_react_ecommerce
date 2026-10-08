import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Class Name Combiner & Tailwind Conflict Resolver (`cn`)
 *
 * 1. `clsx`: Conditionally toggles classes based on booleans or objects:
 *    `clsx('btn', isActive && 'btn-active')`
 * 2. `twMerge`: Solves the Tailwind specificity conflict problem by intelligently
 *    overriding earlier classes with later ones (e.g. `cn('p-2', 'p-4')` -> `'p-4'`).
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Converts an Inertia Link href prop or Wayfinder RouteDefinition to a plain URL string.
 *
 * Useful for extracting strings when passing route definitions to keys or native HTML elements.
 */
export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

