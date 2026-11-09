<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_gm_can_view_employee_list(): void
    {
        $gm = $this->createGM();
        $this->createEmployee();

        $response = $this->actingAs($gm)->get('/gm/employees');

        $response->assertStatus(200);
    }

    public function test_gm_can_create_a_new_employee(): void
    {
        $gm = $this->createGM();
        $deptPos = $this->createDepartmentAndPosition();

        $payload = [
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@test.com',
            'password' => 'password123',
            'phone' => '08123456789',
            'department_id' => $deptPos['department']->id,
            'position_id' => $deptPos['position']->id,
            'gender' => 'male',
            'address' => 'Jl. Sudirman No. 10',
            'join_date' => now()->toDateString(),
            'employment_status' => 'permanent',
            'basic_salary' => 9500000,
            'bank_name' => 'BCA',
            'bank_account_number' => '88997766',
            'bank_account_holder' => 'Budi Santoso',
        ];

        $response = $this->actingAs($gm)->post('/gm/employees', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@test.com',
            'role' => 'employee',
        ]);
        $this->assertDatabaseHas('employees', [
            'basic_salary' => 9500000,
            'bank_name' => 'BCA',
        ]);
    }

    public function test_gm_can_view_employee_details(): void
    {
        $gm = $this->createGM();
        $data = $this->createEmployee();
        $employee = $data['employee'];

        $response = $this->actingAs($gm)->get("/gm/employees/{$employee->id}");

        $response->assertStatus(200);
    }

    public function test_gm_can_update_employee_details(): void
    {
        $gm = $this->createGM();
        $data = $this->createEmployee();
        $employee = $data['employee'];
        $user = $data['user'];

        $updatePayload = [
            'name' => 'Updated Employee Name',
            'email' => $user->email,
            'phone' => '0899999999',
            'department_id' => $employee->department_id,
            'position_id' => $employee->position_id,
            'gender' => 'female',
            'address' => 'Alamat baru',
            'join_date' => $employee->join_date->toDateString(),
            'employment_status' => 'contract',
            'basic_salary' => 11000000,
            'bank_name' => 'Mandiri',
            'bank_account_number' => '11223344',
            'bank_account_holder' => 'Updated Name',
            'status' => 'active',
        ];

        $response = $this->actingAs($gm)->put("/gm/employees/{$employee->id}", $updatePayload);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Employee Name']);
        $this->assertDatabaseHas('employees', ['id' => $employee->id, 'basic_salary' => 11000000, 'bank_name' => 'Mandiri']);
    }

    public function test_gm_can_toggle_employee_status(): void
    {
        $gm = $this->createGM();
        $data = $this->createEmployee([], ['status' => 'active']);
        $employee = $data['employee'];

        $response = $this->actingAs($gm)->patch("/gm/employees/{$employee->id}/toggle-status");

        $response->assertRedirect();
        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'status' => 'inactive',
        ]);
    }

    public function test_non_gm_cannot_create_employee(): void
    {
        $data = $this->createEmployee();
        $employeeUser = $data['user'];

        $response = $this->actingAs($employeeUser)->post('/gm/employees', [
            'name' => 'Unauthorized Employee',
        ]);

        $response->assertStatus(403);
    }
}
