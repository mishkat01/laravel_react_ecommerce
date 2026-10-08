import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

/**
 * Custom Hook: `useFlashToast`
 *
 * Listens for Laravel session flash messages delivered by Inertia.js.
 *
 * How it works:
 * 1. In Laravel controllers:
 *    `Inertia::flash('toast', ['type' => 'success', 'message' => 'Team updated.'])`
 * 2. Inertia intercepts the HTTP redirect and emits a client-side 'flash' event.
 * 3. This hook catches the event and triggers Sonner's toast notification (`toast.success(...)`).
 */
export function useFlashToast(): void {
    useEffect(() => {
        // Register Inertia flash listener
        return router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (!data) {
                return;
            }

            // Display toast notification dynamically by type ('success', 'error', 'info', etc.)
            toast[data.type](data.message);
        });
    }, []);
}

