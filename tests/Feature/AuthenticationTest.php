<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_gm_can_authenticate_and_redirects_to_gm_dashboard(): void
    {
        $gm = $this->createGM(['email' => 'gm@test.com']);

        $response = $this->post('/login', [
            'email' => 'gm@test.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($gm);
        $response->assertRedirect(route('gm.dashboard'));
    }

    public function test_employee_can_authenticate_and_redirects_to_employee_dashboard(): void
    {
        $data = $this->createEmployee(['email' => 'emp@test.com']);
        $employeeUser = $data['user'];

        $response = $this->post('/login', [
            'email' => 'emp@test.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($employeeUser);
        $response->assertRedirect(route('employee.dashboard'));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $gm = $this->createGM(['email' => 'gm@test.com']);

        $this->post('/login', [
            'email' => 'gm@test.com',
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $gm = $this->createGM();

        $response = $this->actingAs($gm)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/login');
    }

    public function test_employee_cannot_access_gm_routes(): void
    {
        $data = $this->createEmployee();
        $employeeUser = $data['user'];

        $response = $this->actingAs($employeeUser)->get('/gm/dashboard');

        $response->assertStatus(403);
    }

    public function test_gm_cannot_access_employee_routes(): void
    {
        $gm = $this->createGM();

        $response = $this->actingAs($gm)->get('/employee/dashboard');

        $response->assertStatus(403);
    }

    public function test_guest_is_redirected_to_login_from_protected_routes(): void
    {
        $response = $this->get('/gm/dashboard');
        $response->assertRedirect('/login');

        $response = $this->get('/employee/dashboard');
        $response->assertRedirect('/login');
    }
}
