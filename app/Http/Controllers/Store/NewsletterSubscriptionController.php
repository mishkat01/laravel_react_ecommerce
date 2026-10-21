<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use App\Services\StorefrontSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Collects newsletter sign-ups from the storefront.
 */
class NewsletterSubscriptionController extends Controller
{
    /**
     * Subscribe an email address. Re-subscribing an existing address succeeds silently.
     */
    public function store(Request $request, StorefrontSettings $settings): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        NewsletterSubscriber::query()->firstOrCreate(['email' => strtolower($validated['email'])]);

        Inertia::flash('toast', ['type' => 'success', 'message' => $settings->section('newsletter')['success_message']]);

        return back();
    }
}
