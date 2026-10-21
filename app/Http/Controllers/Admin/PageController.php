<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SavePageRequest;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Manage Markdown content pages linked from the storefront footer.
 */
class PageController extends Controller
{
    /**
     * Display the page list.
     */
    public function index(): Response
    {
        return Inertia::render('admin/pages/index', [
            'pages' => Page::query()
                ->orderBy('title')
                ->get(['id', 'title', 'slug', 'is_published', 'updated_at'])
                ->map(fn (Page $page) => [
                    ...$page->only(['id', 'title', 'slug', 'is_published']),
                    'updated_at' => $page->updated_at?->toIso8601String(),
                ]),
        ]);
    }

    /**
     * Show the form for creating a page.
     */
    public function create(): Response
    {
        return Inertia::render('admin/pages/form', ['page' => null]);
    }

    /**
     * Store a new page.
     */
    public function store(SavePageRequest $request): RedirectResponse
    {
        $page = Page::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Page ":title" created.', ['title' => $page->title])]);

        return to_route('admin.pages.index');
    }

    /**
     * Show the form for editing a page.
     */
    public function edit(Page $page): Response
    {
        return Inertia::render('admin/pages/form', [
            'page' => $page->only(['id', 'title', 'slug', 'content', 'is_published']),
        ]);
    }

    /**
     * Update a page.
     */
    public function update(SavePageRequest $request, Page $page): RedirectResponse
    {
        $page->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Page ":title" saved.', ['title' => $page->title])]);

        return to_route('admin.pages.index');
    }

    /**
     * Delete a page.
     */
    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Page ":title" deleted.', ['title' => $page->title])]);

        return to_route('admin.pages.index');
    }
}
