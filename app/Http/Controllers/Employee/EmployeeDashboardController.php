<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\PersonalNote;
use App\Models\TaskAssignment;
use App\Models\TaskReport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $employee = $user->employee;

        if (! $employee) {
            abort(403, 'Profil karyawan tidak ditemukan.');
        }

        $today = Carbon::today();

        // 1. Statistics
        $totalAssigned = TaskAssignment::where('employee_id', $employee->id)->count();
        $inProgressCount = TaskAssignment::where('employee_id', $employee->id)
            ->where('status', 'IN_PROGRESS')
            ->count();
        $waitingReviewCount = TaskAssignment::where('employee_id', $employee->id)
            ->whereIn('status', ['IN_REVIEW', 'REVISION'])
            ->count();
        $completedCount = TaskAssignment::where('employee_id', $employee->id)
            ->where('status', 'COMPLETED')
            ->count();
        $overdueCount = TaskAssignment::where('employee_id', $employee->id)
            ->whereNotIn('status', ['COMPLETED', 'CANCELLED'])
            ->whereHas('task', fn ($tq) => $tq->whereDate('due_date', '<', $today))
            ->count();
        $submittedReportsCount = TaskReport::where('employee_id', $employee->id)->count();

        // 2. Active Tasks for Action
        $activeTasks = TaskAssignment::with(['task.category', 'task.creator'])
            ->join('tasks', 'task_assignments.task_id', '=', 'tasks.id')
            ->where('task_assignments.employee_id', $employee->id)
            ->whereNotIn('task_assignments.status', ['COMPLETED', 'CANCELLED'])
            ->orderByRaw("CASE WHEN tasks.priority = 'URGENT' THEN 1 WHEN tasks.priority = 'HIGH' THEN 2 ELSE 3 END")
            ->orderBy('tasks.due_date', 'asc')
            ->select('task_assignments.*')
            ->limit(5)
            ->get();

        // 3. Recent Reports & Reviews
        $recentReports = TaskReport::with(['task', 'reviews.reviewer'])
            ->where('employee_id', $employee->id)
            ->latest('submitted_at')
            ->limit(5)
            ->get();

        // 4. Quick Personal Notes
        $notes = PersonalNote::where('user_id', $user->id)
            ->latest('updated_at')
            ->limit(4)
            ->get();

        return Inertia::render('Employee/Dashboard', [
            'stats' => [
                'totalAssigned' => $totalAssigned,
                'inProgress' => $inProgressCount,
                'waitingReview' => $waitingReviewCount,
                'completed' => $completedCount,
                'overdue' => $overdueCount,
                'submittedReports' => $submittedReportsCount,
            ],
            'activeTasks' => $activeTasks,
            'recentReports' => $recentReports,
            'notes' => $notes,
        ]);
    }
}
