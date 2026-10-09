import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

/**
 * Global App Name
 * Read from the Vite environment variable VITE_APP_NAME defined in .env
 */
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

/**
 * Bootstrap Inertia.js with React
 *
 * `createInertiaApp` connects Laravel's server responses to React components:
 * 1. Resolves the requested page component matching the string sent by `Inertia::render('name')`.
 * 2. Mounts the React application tree into `<div id="app">`.
 * 3. Intercepts `<a>` link clicks and `<form>` submissions to convert them to AJAX visits,
 *    updating state without full page reloads.
 */
void createInertiaApp({
    /**
     * Browser Document Title Template
     * Runs whenever `<Head title="XYZ" />` is used in any React component.
     */
    title: (title) => (title ? `${title} - ${appName}` : appName),

    /**
     * Dynamic Layout Resolution
     *
     * Inertia allows defining persistent layouts globally based on the page's file path.
     * Persistent layouts maintain their state and avoid unnecessary unmounting/remounting
     * when navigating between sibling pages!
     */
    layout: (name) => {
        switch (true) {
            // Landing page ('welcome') renders its own custom storefront layout
            case name === 'welcome':
                return null;

            // Authentication screens ('auth/login', 'auth/register', etc.) use AuthLayout
            case name.startsWith('auth/'):
                return AuthLayout;

            // Admin login screen uses AuthLayout
            case name === 'admin/login':
                return AuthLayout;

            // Admin authenticated screens use AdminLayout
            case name.startsWith('admin/'):
                return AdminLayout;

            // Settings & Team management pages use nested layouts:
            // First wrapped by AppLayout (sidebar + shell), then SettingsLayout (settings nav tabs)
            case name.startsWith('settings/'):
            case name.startsWith('teams/'):
                return [AppLayout, SettingsLayout];

            // All other authenticated pages (e.g., 'dashboard') use AppLayout by default
            default:
                return AppLayout;
        }
    },

    // Wrap the React root in React.StrictMode to detect potential lifecycle bugs
    strictMode: true,

    /**
     * Root Component Wrapper
     * Wraps the entire React application with global providers and overlays:
     * - TooltipProvider: Radix UI tooltip context
     * - Toaster: Sonner toast notification container for flash alerts
     */
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },

    /**
     * Page Visit Progress Indicator
     * Customizes the thin loading bar displayed at the top of the viewport during Inertia visits.
     */
    progress: {
        color: '#4B5563',
    },
});

/**
 * Initialize theme (dark / light / system) from localStorage or cookie
 * to prevent flickering between theme transitions.
 */
initializeTheme();

