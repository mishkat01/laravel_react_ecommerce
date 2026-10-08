import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

/**
 * Appearance Settings Page
 *
 * Renders the theme selection controls (Light, Dark, System).
 *
 * Architecture:
 * - Served by `Route::inertia('settings/appearance', 'settings/appearance')` without needing a controller.
 * - Wraps `<AppearanceTabs />` which updates theme cookies and the `.dark` class on `document.documentElement`.
 */
export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Update the appearance settings for your account"
                />
                {/* Theme selector tabs (Light, Dark, System) */}
                <AppearanceTabs />
            </div>
        </>
    );
}

/**
 * Breadcrumbs configuration for persistent AppLayout
 */
Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};

