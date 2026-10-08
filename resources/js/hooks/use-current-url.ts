/**
 * useCurrentUrl Custom Hook
 *
 * Demonstrates:
 * 1. Inertia.js client-side route tracking via `usePage().url`.
 * 2. URL Path Normalization: Stripping queries, hashes, and protocol differences
 *    using the browser's standard `URL` constructor.
 * 3. Active Navigation State: Providing utility functions (`isCurrentUrl`,
 *    `isCurrentOrParentUrl`, `whenCurrentUrl`) to highlight active links, breadcrumbs,
 *    and sidebar tree menus.
 */

import type { InertiaLinkProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';

/**
 * Checks if a given target URL matches the current active page URL.
 */
export type IsCurrentUrlFn = (
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    currentUrl?: string,
    startsWith?: boolean,
) => boolean;

/**
 * Checks if a given target URL matches the current URL or is a parent prefix of it.
 */
export type IsCurrentOrParentUrlFn = (
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    currentUrl?: string,
) => boolean;

/**
 * Returns `ifTrue` if the URL matches the current page, otherwise returns `ifFalse`.
 */
export type WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    ifTrue: TIfTrue,
    ifFalse?: TIfFalse,
) => TIfTrue | TIfFalse;

/**
 * Return type interface for `useCurrentUrl`.
 */
export type UseCurrentUrlReturn = {
    /** The normalized pathname of the current page (e.g., "/settings/profile") */
    currentUrl: string;
    /** Function to test exact equality of routes */
    isCurrentUrl: IsCurrentUrlFn;
    /** Function to test hierarchical prefix matches */
    isCurrentOrParentUrl: IsCurrentOrParentUrlFn;
    /** Conditional utility helper */
    whenCurrentUrl: WhenCurrentUrlFn;
};

/**
 * Custom React hook for inspecting and comparing the active Inertia route URL.
 */
export function useCurrentUrl(): UseCurrentUrlReturn {
    // Extract current URL state from the Inertia page context
    const page = usePage();

    // Parse the pathname safely (e.g. "/teams/acme/settings" from full URL)
    const currentUrlPath = new URL(
        page.url,
        typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost',
    ).pathname;

    /**
     * Determines if `urlToCheck` matches `currentUrlPath`.
     * Handles string paths, full URLs, and Wayfinder route action objects.
     */
    const isCurrentUrl: IsCurrentUrlFn = (
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        currentUrl?: string,
        startsWith: boolean = false,
    ) => {
        const urlToCompare = currentUrl ?? currentUrlPath;
        const urlString = toUrl(urlToCheck);

        const comparePath = (path: string): boolean =>
            startsWith ? urlToCompare.startsWith(path) : path === urlToCompare;

        // If the URL is relative, compare pathname directly
        if (!urlString.startsWith('http')) {
            return comparePath(urlString);
        }

        // If the URL is absolute, parse out its pathname first
        try {
            const absoluteUrl = new URL(urlString);

            return comparePath(absoluteUrl.pathname);
        } catch {
            return false;
        }
    };

    /**
     * Checks if current URL starts with the given URL path (useful for highlighting parent menus).
     */
    const isCurrentOrParentUrl: IsCurrentOrParentUrlFn = (
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        currentUrl?: string,
    ) => {
        return isCurrentUrl(urlToCheck, currentUrl, true);
    };

    /**
     * Convenience helper to return CSS classes or components conditionally based on active route.
     */
    const handleWhenCurrentUrl: WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        ifTrue: TIfTrue,
        ifFalse: TIfFalse = null as TIfFalse,
    ): TIfTrue | TIfFalse => {
        return isCurrentUrl(urlToCheck) ? ifTrue : ifFalse;
    };

    return {
        currentUrl: currentUrlPath,
        isCurrentUrl,
        isCurrentOrParentUrl,
        whenCurrentUrl: handleWhenCurrentUrl,
    };
}

