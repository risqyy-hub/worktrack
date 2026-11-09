<?php

namespace Tests;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Hash;

abstract class TestCase extends BaseTestCase
{
    protected function createGM(array $attributes = []): User
    {
        return User::create(array_merge([
            'name' => 'General Manager Demo',
            'email' => 'gm_test_'.uniqid().'@worktrack.com',
            'password' => Hash::make('password'),
            'role' => 'gm',
            'status' => 'active',
        ], $attributes));
    }

    protected function createDepartmentAndPosition(): array
    {
        $department = Department::create([
            'name' => 'IT Department '.uniqid(),
            'code' => 'IT'.rand(10, 99),
            'description' => 'Test Department',
            'is_active' => true,
        ]);

        $position = Position::create([
            'department_id' => $department->id,
            'name' => 'Software Engineer '.uniqid(),
            'description' => 'Test Position',
            'base_salary' => 8000000,
            'is_active' => true,
        ]);

        return ['department' => $department, 'position' => $position];
    }

    protected function createEmployee(array $userAttributes = [], array $employeeAttributes = []): array
    {
        $deptPos = $this->createDepartmentAndPosition();

        $user = User::create(array_merge([
            'name' => 'Employee Test '.uniqid(),
            'email' => 'emp_test_'.uniqid().'@worktrack.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'status' => 'active',
        ], $userAttributes));

        $employee = Employee::create(array_merge([
            'user_id' => $user->id,
            'department_id' => $deptPos['department']->id,
            'position_id' => $deptPos['position']->id,
            'employee_code' => 'EMP'.rand(1000, 9999),
            'join_date' => now()->subMonths(6)->toDateString(),
            'status' => 'active',
            'basic_salary' => 8000000,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
        ], $employeeAttributes));

        return ['user' => $user, 'employee' => $employee];
    }
}
