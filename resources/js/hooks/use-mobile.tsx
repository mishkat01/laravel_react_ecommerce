/**
 * useIsMobile Custom Hook
 *
 * Demonstrates:
 * 1. React 18+ `useSyncExternalStore` pattern for browser media queries.
 * 2. Avoiding SSR Hydration Mismatch: `getServerSnapshot()` ensures that server
 *    renders with a deterministic fallback (`false`), avoiding hydration mismatches.
 * 3. Event-driven subscriptions: subscribes to window `matchMedia('change')`
 *    without causing wasteful re-renders on window resize unless the breakpoint boundary is crossed.
 */

import { useSyncExternalStore } from 'react';

/** Breakpoint definition matching Tailwind CSS `md` (768px) */
const MOBILE_BREAKPOINT = 768;

/**
 * Singleton MediaQueryList instance initialized outside the component tree.
 * Guarded against SSR environments where `window` is undefined.
 */
const mql =
    typeof window === 'undefined'
        ? undefined
        : window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

/**
 * Subscription function passed to `useSyncExternalStore`.
 * Listens to CSS media query change events and returns a cleanup callback.
 */
function mediaQueryListener(callback: (event: MediaQueryListEvent) => void) {
    if (!mql) {
        return () => {};
    }

    mql.addEventListener('change', callback);

    return () => {
        mql.removeEventListener('change', callback);
    };
}

/**
 * Client-side snapshot getter: returns boolean true if screen is narrower than 768px.
 */
function isSmallerThanBreakpoint(): boolean {
    return mql?.matches ?? false;
}

/**
 * Server-side snapshot getter: defaults safely to false during server-side rendering.
 */
function getServerSnapshot(): boolean {
    return false;
}

/**
 * Custom hook returning whether the current viewport is mobile-sized (< 768px).
 * Automatically updates whenever the viewport crosses the 768px boundary.
 */
export function useIsMobile(): boolean {
    return useSyncExternalStore(
        mediaQueryListener,
        isSmallerThanBreakpoint,
        getServerSnapshot,
    );
}

