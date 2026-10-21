<?php

namespace App\Http\Requests\Admin;

use App\Rules\ImageUrl;
use App\Rules\SafeLink;
use App\Services\StorefrontSettings;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates one storefront content section. The section comes from the route and is
 * constrained to `StorefrontSettings::SECTIONS`, so every branch below is reachable.
 */
class UpdateStorefrontSectionRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $text = fn (int $max = 255, bool $required = false) => [$required ? 'required' : 'nullable', 'string', "max:{$max}"];
        $link = fn (bool $required = false) => [$required ? 'required' : 'nullable', 'string', 'max:2048', new SafeLink];
        $icon = ['required', Rule::in(StorefrontSettings::ICONS)];

        return match ($this->route('section')) {
            'store' => [
                'name' => $text(120, true),
                'tagline' => $text(),
                'logo_text' => $text(3, true),
                'currency' => ['required', 'string', 'size:3', 'alpha'],
                'support_email' => ['nullable', 'email', 'max:255'],
                'support_phone' => $text(40),
                'shipping_fee' => ['required', 'numeric', 'min:0', 'max:100000'],
                'free_shipping_threshold' => ['nullable', 'numeric', 'min:0', 'max:100000000'],
            ],
            'announcement' => [
                'enabled' => ['boolean'],
                'text' => $text(200),
                'code' => $text(50),
                'link_label' => $text(60),
                'link_url' => $link(),
            ],
            'hero' => [
                'badge' => $text(80),
                'badge_note' => $text(60),
                'title' => $text(120, true),
                'highlight' => $text(120),
                'description' => $text(500),
                'cta_label' => $text(60, true),
                'cta_url' => $link(true),
                'promo_code' => $text(50),
                'promo_label' => $text(60),
                'product_id' => ['nullable', 'integer', Rule::exists('products', 'id')],
                'product_label' => $text(60),
                'ribbon' => $text(60),
                'highlights' => ['array', 'max:4'],
                'highlights.*' => $text(60, true),
                'rating_value' => $text(20),
                'rating_label' => $text(60),
                'avatars' => ['array', 'max:5'],
                'avatars.*' => ['required', 'string', 'max:2048', new ImageUrl],
                'trust_items' => ['array', 'max:3'],
                'trust_items.*.icon' => $icon,
                'trust_items.*.text' => $text(60, true),
            ],
            'features' => [
                'enabled' => ['boolean'],
                'items' => ['array', 'max:8'],
                'items.*.icon' => $icon,
                'items.*.title' => $text(80, true),
                'items.*.description' => $text(250),
                'items.*.highlight' => $text(40),
            ],
            'categories' => [
                'enabled' => ['boolean'],
                'eyebrow' => $text(60),
                'title' => $text(120, true),
                'description' => $text(300),
                'limit' => ['required', 'integer', 'min:1', 'max:12'],
            ],
            'products' => [
                'enabled' => ['boolean'],
                'eyebrow' => $text(60),
                'title' => $text(120, true),
                'limit' => ['required', 'integer', 'min:4', 'max:24'],
                'cta_label' => $text(60),
            ],
            'deal' => [
                'enabled' => ['boolean'],
                'eyebrow' => $text(60),
                'title' => $text(160, true),
                'description' => $text(400),
                'cta_label' => $text(60, true),
                'cta_url' => $link(true),
                'code' => $text(50),
                'ends_at' => ['nullable', 'date'],
                'footnote' => $text(200),
            ],
            'testimonials' => [
                'enabled' => ['boolean'],
                'press_label' => $text(120),
                'press' => ['array', 'max:6'],
                'press.*.name' => $text(40, true),
                'press.*.quote' => $text(200, true),
                'eyebrow' => $text(60),
                'title' => $text(120, true),
                'description' => $text(300),
                'items' => ['array', 'max:9'],
                'items.*.author' => $text(80, true),
                'items.*.role' => $text(80),
                'items.*.avatar' => ['nullable', 'string', 'max:2048', new ImageUrl],
                'items.*.rating' => ['required', 'integer', 'between:1,5'],
                'items.*.content' => $text(600, true),
                'items.*.verified' => ['boolean'],
            ],
            'newsletter' => [
                'enabled' => ['boolean'],
                'eyebrow' => $text(60),
                'title' => $text(120, true),
                'description' => $text(300),
                'placeholder' => $text(80),
                'button_label' => $text(30, true),
                'success_message' => $text(200, true),
                'perks' => ['array', 'max:4'],
                'perks.*' => $text(60, true),
            ],
            'footer' => [
                'about' => $text(500),
                'socials' => ['array', 'max:7'],
                'socials.*.platform' => ['required', Rule::in(StorefrontSettings::SOCIAL_PLATFORMS)],
                'socials.*.url' => ['required', 'url:http,https', 'max:2048'],
                'columns' => ['array', 'max:4'],
                'columns.*.title' => $text(60, true),
                'columns.*.links' => ['array', 'max:10'],
                'columns.*.links.*.label' => $text(60, true),
                'columns.*.links.*.url' => $link(true),
                'copyright' => $text(200),
                'payment_badges' => ['array', 'max:8'],
                'payment_badges.*' => $text(20, true),
                'legal_links' => ['array', 'max:5'],
                'legal_links.*.label' => $text(60, true),
                'legal_links.*.url' => $link(true),
            ],
        };
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'items.*.title' => __('title'),
            'items.*.author' => __('author'),
            'items.*.content' => __('review'),
            'press.*.name' => __('publication'),
            'press.*.quote' => __('quote'),
            'columns.*.links.*.label' => __('link label'),
            'columns.*.links.*.url' => __('link URL'),
            'legal_links.*.label' => __('link label'),
            'legal_links.*.url' => __('link URL'),
            'socials.*.url' => __('profile URL'),
        ];
    }
}
