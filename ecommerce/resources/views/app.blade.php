<!DOCTYPE html>
{{--
|--------------------------------------------------------------------------
| Root Blade Template for Inertia.js + React SPA
|--------------------------------------------------------------------------
|
| In an Inertia.js architecture, this is the ONLY Blade file used for rendering.
| Instead of generating full HTML views for each route, Laravel sends this layout
| on the initial HTTP request.
| Inside <body>, `<x-inertia::app />` generates:
|   <div id="app" data-page='{"component":"...","props":{...}}'></div>
| React then mounts onto this element in `resources/js/app.tsx`.
--}}
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{--
            Prevent flash of unstyled theme (FOUC):
            If the user selected 'system' theme preference, check the browser's
            `prefers-color-scheme: dark` media query and apply the `.dark` class
            immediately before rendering starts.
        --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{--
            Set baseline background colors using modern OKLCH color space
            so the page never flashes white during dark mode loading.
        --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        {{-- Favicons & Touch Icons --}}
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        {{--
            Vite Integration:
            1. @viteReactRefresh: Enables React Fast Refresh (HMR) during `npm run dev`.
            2. @vite([...]): Injects the compiled CSS, main JS/TSX bootstrap, and
               the dynamic page component needed for the current Inertia visit.
        --}}
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])

        {{--
            Inertia Head:
            Provides a target for React `<Head title="..." />` components
            to dynamically update page titles and meta tags.
        --}}
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        {{--
            The mounting point for the React application:
            Contains the `data-page` JSON payload with initial props passed from Laravel.
        --}}
        <x-inertia::app />
    </body>
</html>
