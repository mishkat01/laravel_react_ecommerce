<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_screen_can_be_rendered_at_admin_route(): void
    {
        $response = $this->get('/admin');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/login')
        );
    }

    public function test_admin_login_url_redirects_to_admin_route(): void
    {
        $response = $this->get('/admin/login');

        $response->assertRedirect('/admin');
    }

    public function test_admin_can_authenticate_using_the_admin_login_screen(): void
    {
        $admin = Admin::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response = $this->post(route('admin.login.store'), [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($admin, 'admin');
        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_admin_cannot_authenticate_with_invalid_password(): void
    {
        $admin = Admin::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response = $this->post(route('admin.login.store'), [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);

        $this->assertGuest('admin');
        $response->assertSessionHasErrors('email');
    }

    public function test_regular_user_credentials_cannot_login_as_admin(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'password',
        ]);

        $response = $this->post(route('admin.login.store'), [
            'email' => 'user@example.com',
            'password' => 'password',
        ]);

        $this->assertGuest('admin');
        $response->assertSessionHasErrors('email');
    }

    public function test_admin_is_redirected_to_dashboard_if_already_authenticated(): void
    {
        $admin = Admin::factory()->create();

        $response = $this->actingAs($admin, 'admin')->get(route('admin.login'));

        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_admin_can_logout(): void
    {
        $admin = Admin::factory()->create();

        $response = $this->actingAs($admin, 'admin')->post(route('admin.logout'));

        $this->assertGuest('admin');
        $response->assertRedirect(route('admin.login'));
    }

    public function test_admin_login_is_rate_limited(): void
    {
        $admin = Admin::factory()->create([
            'email' => 'admin@example.com',
        ]);

        RateLimiter::increment(
            strtolower('admin@example.com').'|127.0.0.1',
            amount: 5
        );

        $response = $this->post(route('admin.login.store'), [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest('admin');
    }
}
