<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

/**
 * Accepts site-relative paths (`/shop`), in-page anchors (`#deals`), and http(s), mailto, or tel URLs.
 * Rejects `javascript:` and other schemes that could run script when rendered as a link.
 */
class SafeLink implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail(__('The :attribute must be a link.'));

            return;
        }

        $isRelative = (str_starts_with($value, '/') && ! str_starts_with($value, '//')) || str_starts_with($value, '#');
        $scheme = strtolower((string) parse_url($value, PHP_URL_SCHEME));
        $isAllowedAbsolute = in_array($scheme, ['http', 'https', 'mailto', 'tel'], true);

        if (! $isRelative && ! $isAllowedAbsolute) {
            $fail(__('The :attribute must start with "/", "#", "http(s)://", "mailto:" or "tel:".'));
        }
    }
}
