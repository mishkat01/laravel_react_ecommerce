<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Browse, export, and remove newsletter subscribers.
 */
class NewsletterSubscriberController extends Controller
{
    /**
     * Display the subscriber list.
     */
    public function index(Request $request): Response
    {
        $term = trim((string) $request->string('q')) ?: null;

        return Inertia::render('admin/subscribers/index', [
            'subscribers' => NewsletterSubscriber::query()
                ->when($term, fn ($query, string $term) => $query->where('email', 'like', "%{$term}%"))
                ->latest()
                ->paginate(25)
                ->withQueryString(),
            'filters' => ['q' => $term],
            'total' => NewsletterSubscriber::query()->count(),
        ]);
    }

    /**
     * Download every subscriber as CSV.
     */
    public function export(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['email', 'subscribed_at']);

            NewsletterSubscriber::query()->orderBy('id')->lazy()->each(
                fn (NewsletterSubscriber $subscriber) => fputcsv($handle, [$subscriber->email, $subscriber->created_at?->toDateTimeString()]),
            );

            fclose($handle);
        }, 'newsletter-subscribers-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * Remove a subscriber.
     */
    public function destroy(NewsletterSubscriber $subscriber): RedirectResponse
    {
        $subscriber->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':email unsubscribed.', ['email' => $subscriber->email])]);

        return back();
    }
}
