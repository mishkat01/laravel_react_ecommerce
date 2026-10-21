<?php

namespace App\Models;

use Database\Factories\PageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Page Model
 *
 * An admin-authored content page (About, Shipping, Privacy Policy, ...) written in Markdown.
 *
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string $content
 * @property bool $is_published
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'slug', 'content', 'is_published'])]
class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use HasFactory;

    /**
     * Render the Markdown content to HTML. Raw HTML in the source is escaped and unsafe links are stripped.
     */
    public function renderedContent(): string
    {
        return Str::markdown($this->content, [
            'html_input' => 'escape',
            'allow_unsafe_links' => false,
        ]);
    }

    /**
     * Get the attributes that should be cast to native types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    /**
     * Resolve pages by slug in route model binding.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
