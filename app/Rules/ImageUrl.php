<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

/**
 * Accepts an image uploaded through the admin uploader (`/storage/...`) or an absolute http(s) URL.
 */
class ImageUrl implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail(__('The :attribute must be an image URL.'));

            return;
        }

        $isUploadedFile = str_starts_with($value, '/storage/') && ! str_contains($value, '..');
        $isRemoteUrl = filter_var($value, FILTER_VALIDATE_URL) !== false
            && in_array(parse_url($value, PHP_URL_SCHEME), ['http', 'https'], true);

        if (! $isUploadedFile && ! $isRemoteUrl) {
            $fail(__('The :attribute must be an uploaded image or an http(s) URL.'));
        }
    }
}
