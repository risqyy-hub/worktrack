<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\TaskCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function createCategory(): TaskCategory
    {
        return TaskCategory::create([
            'name' => 'Development',
            'color' => '#1769E8',
            'description' => 'Development tasks',
            'is_active' => true,
        ]);
    }

    public function test_gm_can_create_and_delegate_task_to_employee(): void
    {
        $gm = $this->createGM();
        $cat = $this->createCategory();
        $empData = $this->createEmployee();
        $employee = $empData['employee'];

        $payload = [
            'title' => 'Bangun Sistem Autentikasi',
            'description' => 'Implementasi RBAC dan multi-factor login',
            'category_id' => $cat->id,
            'priority' => 'HIGH',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(7)->toDateString(),
            'employee_ids' => [$employee->id],
        ];

        $response = $this->actingAs($gm)->post('/gm/tasks', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', [
            'title' => 'Bangun Sistem Autentikasi',
            'priority' => 'HIGH',
            'status' => 'TODO',
        ]);

        $task = Task::first();
        $this->assertDatabaseHas('task_assignments', [
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'status' => 'TODO',
        ]);
    }

    public function test_employee_can_view_assigned_tasks(): void
    {
        $gm = $this->createGM();
        $cat = $this->createCategory();
        $empData = $this->createEmployee();
        $employee = $empData['employee'];
        $user = $empData['user'];

        $task = Task::create([
            'task_code' => 'TSK-2026-001',
            'title' => 'Tugas Karyawan A',
            'category_id' => $cat->id,
            'priority' => 'MEDIUM',
            'status' => 'TODO',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(5)->toDateString(),
            'created_by_user_id' => $gm->id,
        ]);

        TaskAssignment::create([
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'status' => 'TODO',
            'progress_percent' => 0,
            'assigned_by_user_id' => $gm->id,
        ]);

        $response = $this->actingAs($user)->get('/employee/tasks');
        $response->assertStatus(200);

        $responseDashboard = $this->actingAs($user)->get('/employee/dashboard');
        $responseDashboard->assertStatus(200);

        $responseDetail = $this->actingAs($user)->get("/employee/tasks/{$task->id}");
        $responseDetail->assertStatus(200);
    }

    public function test_employee_can_start_task(): void
    {
        $gm = $this->createGM();
        $cat = $this->createCategory();
        $empData = $this->createEmployee();
        $employee = $empData['employee'];
        $user = $empData['user'];

        $task = Task::create([
            'task_code' => 'TSK-2026-002',
            'title' => 'Tugas Mulai',
            'category_id' => $cat->id,
            'priority' => 'URGENT',
            'status' => 'TODO',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(3)->toDateString(),
            'created_by_user_id' => $gm->id,
        ]);

        TaskAssignment::create([
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'status' => 'TODO',
            'progress_percent' => 0,
            'assigned_by_user_id' => $gm->id,
        ]);

        $response = $this->actingAs($user)->post("/employee/tasks/{$task->id}/start");

        $response->assertRedirect();
        $this->assertDatabaseHas('task_assignments', [
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'status' => 'IN_PROGRESS',
        ]);
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'IN_PROGRESS',
        ]);
    }

    public function test_employee_can_update_task_progress(): void
    {
        $gm = $this->createGM();
        $cat = $this->createCategory();
        $empData = $this->createEmployee();
        $employee = $empData['employee'];
        $user = $empData['user'];

        $task = Task::create([
            'task_code' => 'TSK-2026-003',
            'title' => 'Tugas Progres',
            'category_id' => $cat->id,
            'priority' => 'MEDIUM',
            'status' => 'IN_PROGRESS',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(3)->toDateString(),
            'created_by_user_id' => $gm->id,
        ]);

        TaskAssignment::create([
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'status' => 'IN_PROGRESS',
            'progress_percent' => 20,
            'assigned_by_user_id' => $gm->id,
        ]);

        $response = $this->actingAs($user)->post("/employee/tasks/{$task->id}/progress", [
            'progress_percent' => 75,
            'note' => 'Menyelesaikan modul frontend dan integrasi API.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_assignments', [
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'progress_percent' => 75,
        ]);
        $this->assertDatabaseHas('task_progress', [
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'progress_percent' => 75,
            'note' => 'Menyelesaikan modul frontend dan integrasi API.',
        ]);
    }

    public function test_gm_can_update_task_status(): void
    {
        $gm = $this->createGM();
        $cat = $this->createCategory();

        $task = Task::create([
            'task_code' => 'TSK-2026-004',
            'title' => 'Tugas GM Status',
            'category_id' => $cat->id,
            'priority' => 'LOW',
            'status' => 'TODO',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(4)->toDateString(),
            'created_by_user_id' => $gm->id,
        ]);

        $response = $this->actingAs($gm)->patch("/gm/tasks/{$task->id}/status", [
            'status' => 'COMPLETED',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'COMPLETED',
            'progress_percent' => 100,
        ]);
    }
}
