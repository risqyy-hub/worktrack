<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\TaskCategory;
use App\Models\TaskReport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function createCategory(): TaskCategory
    {
        return TaskCategory::create([
            'name' => 'Report Category',
            'color' => '#1769E8',
            'description' => 'Test',
            'is_active' => true,
        ]);
    }

    public function test_employee_can_submit_task_report(): void
    {
        $gm = $this->createGM();
        $cat = $this->createCategory();
        $empData = $this->createEmployee();
        $employee = $empData['employee'];
        $user = $empData['user'];

        $task = Task::create([
            'task_code' => 'TSK-2026-101',
            'title' => 'Tugas Laporan',
            'category_id' => $cat->id,
            'priority' => 'HIGH',
            'status' => 'IN_PROGRESS',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(5)->toDateString(),
            'created_by_user_id' => $gm->id,
        ]);

        $assignment = TaskAssignment::create([
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'status' => 'IN_PROGRESS',
            'progress_percent' => 50,
            'assigned_by_user_id' => $gm->id,
        ]);

        $payload = [
            'task_assignment_id' => $assignment->id,
            'title' => 'Laporan Hasil Kerja Modul A',
            'work_description' => 'Seluruh fungsi telah selesai diimplementasikan dan diuji coba.',
            'result_summary' => 'Berjalan sukses 100%',
            'obstacles' => 'Tidak ada kendala berarti',
            'progress_percent' => 100,
        ];

        $response = $this->actingAs($user)->post('/employee/reports', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_reports', [
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'title' => 'Laporan Hasil Kerja Modul A',
            'status' => 'SUBMITTED',
            'progress_percent' => 100,
        ]);

        // Task and assignment should transition to IN_REVIEW
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'IN_REVIEW']);
        $this->assertDatabaseHas('task_assignments', ['id' => $assignment->id, 'status' => 'IN_REVIEW']);
    }

    public function test_gm_can_review_and_approve_report(): void
    {
        $gm = $this->createGM();
        $cat = $this->createCategory();
        $empData = $this->createEmployee();
        $employee = $empData['employee'];

        $task = Task::create([
            'task_code' => 'TSK-2026-102',
            'title' => 'Tugas Approve',
            'category_id' => $cat->id,
            'priority' => 'MEDIUM',
            'status' => 'IN_REVIEW',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(2)->toDateString(),
            'created_by_user_id' => $gm->id,
        ]);

        $assignment = TaskAssignment::create([
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'status' => 'IN_REVIEW',
            'progress_percent' => 100,
            'assigned_by_user_id' => $gm->id,
        ]);

        $report = TaskReport::create([
            'report_code' => 'RPT-2026-001',
            'task_id' => $task->id,
            'task_assignment_id' => $assignment->id,
            'employee_id' => $employee->id,
            'title' => 'Deliverable Selesai',
            'work_description' => 'Deskripsi pekerjaan',
            'progress_percent' => 100,
            'status' => 'SUBMITTED',
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($gm)->post("/gm/reports/{$report->id}/review", [
            'status' => 'APPROVED',
            'notes' => 'Hasil pekerjaan sangat baik dan memenuhi standar.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_reports', [
            'id' => $report->id,
            'status' => 'APPROVED',
        ]);
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'COMPLETED',
            'progress_percent' => 100,
        ]);
        $this->assertDatabaseHas('task_assignments', [
            'id' => $assignment->id,
            'status' => 'COMPLETED',
            'progress_percent' => 100,
        ]);
    }

    public function test_gm_can_request_revision_and_employee_can_respond(): void
    {
        $gm = $this->createGM();
        $cat = $this->createCategory();
        $empData = $this->createEmployee();
        $employee = $empData['employee'];
        $user = $empData['user'];

        $task = Task::create([
            'task_code' => 'TSK-2026-103',
            'title' => 'Tugas Revisi',
            'category_id' => $cat->id,
            'priority' => 'HIGH',
            'status' => 'IN_REVIEW',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(2)->toDateString(),
            'created_by_user_id' => $gm->id,
        ]);

        $assignment = TaskAssignment::create([
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'status' => 'IN_REVIEW',
            'progress_percent' => 80,
            'assigned_by_user_id' => $gm->id,
        ]);

        $report = TaskReport::create([
            'report_code' => 'RPT-2026-002',
            'task_id' => $task->id,
            'task_assignment_id' => $assignment->id,
            'employee_id' => $employee->id,
            'title' => 'Laporan Butuh Revisi',
            'work_description' => 'Deskripsi pekerjaan awal',
            'progress_percent' => 80,
            'status' => 'SUBMITTED',
            'submitted_at' => now(),
        ]);

        // GM requests revision
        $gmResponse = $this->actingAs($gm)->post("/gm/reports/{$report->id}/review", [
            'status' => 'REVISION_REQUESTED',
            'notes' => 'Harap lengkapi dokumentasi endpoint dan test coverage.',
        ]);

        $gmResponse->assertRedirect();
        $this->assertDatabaseHas('task_reports', [
            'id' => $report->id,
            'status' => 'REVISION_REQUESTED',
        ]);
        $this->assertDatabaseHas('report_revisions', [
            'task_report_id' => $report->id,
            'feedback_notes' => 'Harap lengkapi dokumentasi endpoint dan test coverage.',
            'status' => 'OPEN',
        ]);

        // Employee responds to revision
        $empResponse = $this->actingAs($user)->post("/employee/reports/{$report->id}/revision-response", [
            'response' => 'Dokumentasi telah diperbarui di Swagger dan test suite ditambahkan.',
        ]);

        $empResponse->assertRedirect();
        $this->assertDatabaseHas('report_revisions', [
            'task_report_id' => $report->id,
            'employee_response' => 'Dokumentasi telah diperbarui di Swagger dan test suite ditambahkan.',
            'status' => 'RESOLVED',
        ]);
        $this->assertDatabaseHas('task_reports', [
            'id' => $report->id,
            'status' => 'SUBMITTED',
        ]);
    }
}
