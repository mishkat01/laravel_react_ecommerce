<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateStorefrontSectionRequest;
use App\Models\Product;
use App\Services\StorefrontSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Edit every section of the storefront landing page and the store-wide settings.
 */
class StorefrontContentController extends Controller
{
    /**
     * Show the storefront content editor.
     */
    public function edit(StorefrontSettings $settings): Response
    {
        return Inertia::render('admin/storefront/edit', [
            'sections' => $settings->all(),
            'products' => Product::query()->orderBy('name')->get(['id', 'name']),
            'icons' => StorefrontSettings::ICONS,
            'socialPlatforms' => StorefrontSettings::SOCIAL_PLATFORMS,
        ]);
    }

    /**
     * Save one section.
     */
    public function update(UpdateStorefrontSectionRequest $request, StorefrontSettings $settings, string $section): RedirectResponse
    {
        $settings->update($section, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':section section saved.', ['section' => Str::headline($section)])]);

        return back();
    }
}
