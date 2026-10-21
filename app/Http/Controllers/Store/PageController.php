<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders admin-authored content pages such as Shipping & Returns or the Privacy Policy.
 */
class PageController extends Controller
{
    /**
     * Display a published page.
     */
    public function __invoke(Page $page): Response
    {
        abort_unless($page->is_published, 404);

        return Inertia::render('store/page', [
            'page' => [
                'title' => $page->title,
                'slug' => $page->slug,
                'html' => $page->renderedContent(),
                'updated_at' => $page->updated_at?->toIso8601String(),
            ],
        ]);
    }
}
