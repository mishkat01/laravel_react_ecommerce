<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * SiteSetting Model
 *
 * Key/value store for admin-editable storefront content. Each key holds one
 * storefront section (e.g. `hero`, `footer`) as JSON. Read it through
 * `App\Services\StorefrontSettings`, which merges stored values over defaults.
 *
 * @property int $id
 * @property string $key
 * @property array<string, mixed> $value
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['key', 'value'])]
class SiteSetting extends Model
{
    /**
     * Get the attributes that should be cast to native types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }
}
