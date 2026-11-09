<?php

namespace App\Http\Controllers\GM;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Task;
use App\Models\TaskReport;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class GMDashboardController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today();

        // 1. Statistics Cards
        $totalEmployees = Employee::where('status', 'active')->count();
        $totalTasks = Task::count();
        $completedTasks = Task::where('status', 'COMPLETED')->count();
        $inProgressTasks = Task::where('status', 'IN_PROGRESS')->count();
        $upcomingTasks = Task::where('status', 'UPCOMING')->count();
        $overdueTasks = Task::whereNotIn('status', ['COMPLETED', 'CANCELLED'])
            ->whereDate('due_date', '<', $today)
            ->count();
        $submittedReports = TaskReport::where('status', 'SUBMITTED')->count();
        $totalPayrollExpense = (float) Payroll::sum('net_salary');

        // 2. Charts Data
        // Task status distribution
        $statusDistribution = [
            ['name' => 'Selesai', 'value' => $completedTasks, 'color' => '#10B981'],
            ['name' => 'Dalam Proses', 'value' => $inProgressTasks, 'color' => '#1769E8'],
            ['name' => 'Menunggu', 'value' => Task::where('status', 'TODO')->count(), 'color' => '#F59E0B'],
            ['name' => 'Mendatang', 'value' => $upcomingTasks, 'color' => '#8B5CF6'],
            ['name' => 'Terlambat', 'value' => $overdueTasks, 'color' => '#EF4444'],
        ];

        // Monthly task completion (last 6 months)
        $monthlyTaskCompletion = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthLabel = $month->translatedFormat('M Y');
            $created = Task::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            $completed = Task::where('status', 'COMPLETED')
                ->whereYear('completed_at', $month->year)
                ->whereMonth('completed_at', $month->month)
                ->count();

            $monthlyTaskCompletion[] = [
                'month' => $monthLabel,
                'Dibuat' => $created,
                'Selesai' => $completed,
            ];
        }

        // Productivity by department
        $departmentProductivity = Department::withCount([
            'employees as total_assigned_tasks' => function ($query) {
                $query->join('task_assignments', 'employees.id', '=', 'task_assignments.employee_id');
            },
            'employees as total_completed_tasks' => function ($query) {
                $query->join('task_assignments', 'employees.id', '=', 'task_assignments.employee_id')
                    ->where('task_assignments.status', 'COMPLETED');
            },
        ])->get()->map(function ($dept) {
            $assigned = $dept->total_assigned_tasks ?: 0;
            $completed = $dept->total_completed_tasks ?: 0;
            $rate = $assigned > 0 ? round(($completed / $assigned) * 100) : 0;

            return [
                'department' => $dept->code,
                'name' => $dept->name,
                'assigned' => $assigned,
                'completed' => $completed,
                'rate' => $rate,
            ];
        });

        // 3. Recent Activities
        $recentActivities = ActivityLog::with('user')
            ->latest('created_at')
            ->limit(8)
            ->get();

        // 4. Pending Reports Needing Review
        $pendingReports = TaskReport::with(['task', 'employee.user'])
            ->where('status', 'SUBMITTED')
            ->latest('submitted_at')
            ->limit(5)
            ->get();

        // 5. Urgent or Overdue Tasks
        $criticalTasks = Task::with(['category', 'assignments.employee.user'])
            ->whereNotIn('status', ['COMPLETED', 'CANCELLED'])
            ->where(function ($q) use ($today) {
                $q->where('priority', 'URGENT')
                    ->orWhereDate('due_date', '<', $today);
            })
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get();

        return Inertia::render('GM/Dashboard', [
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'totalTasks' => $totalTasks,
                'completedTasks' => $completedTasks,
                'inProgressTasks' => $inProgressTasks,
                'upcomingTasks' => $upcomingTasks,
                'overdueTasks' => $overdueTasks,
                'submittedReports' => $submittedReports,
                'totalPayrollExpense' => $totalPayrollExpense,
            ],
            'charts' => [
                'statusDistribution' => $statusDistribution,
                'monthlyCompletion' => $monthlyTaskCompletion,
                'departmentProductivity' => $departmentProductivity,
            ],
            'recentActivities' => $recentActivities,
            'pendingReports' => $pendingReports,
            'criticalTasks' => $criticalTasks,
        ]);
    }
}
