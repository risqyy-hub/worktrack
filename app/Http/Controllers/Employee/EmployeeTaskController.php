<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\TaskProgress;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeTaskController extends Controller
{
    public function index(Request $request): Response
    {
        $employee = $request->user()->employee;
        $tab = $request->input('tab', 'IN_PROGRESS');
        $priority = $request->input('priority');
        $search = $request->input('search');
        $today = Carbon::today();

        $query = TaskAssignment::with(['task.category', 'task.creator', 'task.attachments'])
            ->where('task_assignments.employee_id', $employee->id);

        if ($tab === 'UPCOMING') {
            $query->where('task_assignments.status', 'UPCOMING');
        } elseif ($tab === 'IN_PROGRESS') {
            $query->whereIn('task_assignments.status', ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'REVISION']);
        } elseif ($tab === 'COMPLETED') {
            $query->where('task_assignments.status', 'COMPLETED');
        }

        if ($priority) {
            $query->whereHas('task', fn ($q) => $q->where('priority', $priority));
        }

        if ($search) {
            $query->whereHas('task', function ($q) use ($search) {
                $q->where('task_code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $assignments = $query->join('tasks', 'task_assignments.task_id', '=', 'tasks.id')
            ->orderBy('tasks.due_date', 'asc')
            ->select('task_assignments.*')
            ->paginate(10)
            ->withQueryString();

        $counts = [
            'ALL' => TaskAssignment::where('employee_id', $employee->id)->count(),
            'UPCOMING' => TaskAssignment::where('employee_id', $employee->id)->where('status', 'UPCOMING')->count(),
            'IN_PROGRESS' => TaskAssignment::where('employee_id', $employee->id)->whereIn('status', ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'REVISION'])->count(),
            'COMPLETED' => TaskAssignment::where('employee_id', $employee->id)->where('status', 'COMPLETED')->count(),
        ];

        return Inertia::render('Employee/Tasks/Index', [
            'assignments' => $assignments,
            'counts' => $counts,
            'filters' => [
                'tab' => $tab,
                'priority' => $priority,
                'search' => $search,
            ],
        ]);
    }

    public function show(Request $request, Task $task): Response
    {
        $employee = $request->user()->employee;

        $assignment = TaskAssignment::where('task_id', $task->id)
            ->where('employee_id', $employee->id)
            ->firstOrFail();

        $task->load([
            'category',
            'creator',
            'attachments',
            'progresses' => fn ($q) => $q->where('employee_id', $employee->id)->latest(),
            'reports' => fn ($q) => $q->where('employee_id', $employee->id)->with(['reviews.reviewer', 'revisions']),
        ]);

        return Inertia::render('Employee/Tasks/Show', [
            'task' => $task,
            'assignment' => $assignment,
        ]);
    }

    public function start(Request $request, Task $task): RedirectResponse
    {
        $employee = $request->user()->employee;

        $assignment = TaskAssignment::where('task_id', $task->id)
            ->where('employee_id', $employee->id)
            ->firstOrFail();

        DB::transaction(function () use ($assignment, $task, $employee, $request) {
            $assignment->update([
                'status' => 'IN_PROGRESS',
                'started_at' => now(),
            ]);

            if ($task->status !== 'IN_PROGRESS') {
                $task->update(['status' => 'IN_PROGRESS']);
            }

            TaskProgress::create([
                'task_id' => $task->id,
                'task_assignment_id' => $assignment->id,
                'employee_id' => $employee->id,
                'progress_percent' => max(5, $assignment->progress_percent),
                'note' => 'Memulai pekerjaan pada tugas ini.',
            ]);

            ActivityLog::record(
                'TASK',
                'START',
                "Karyawan {$request->user()->name} memulai pengerjaan tugas {$task->task_code}",
                $task->id,
                [],
                $request->user()->id
            );
        });

        return back()->with('success', 'Status tugas berhasil diubah menjadi Dalam Proses.');
    }

    public function updateProgress(Request $request, Task $task): RedirectResponse
    {
        $employee = $request->user()->employee;

        $assignment = TaskAssignment::where('task_id', $task->id)
            ->where('employee_id', $employee->id)
            ->firstOrFail();

        $validated = $request->validate([
            'progress_percent' => ['required', 'integer', 'min:1', 'max:100'],
            'note' => ['required', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($task, $assignment, $employee, $validated, $request) {
            $assignment->update([
                'progress_percent' => $validated['progress_percent'],
                'status' => 'IN_PROGRESS',
            ]);

            TaskProgress::create([
                'task_id' => $task->id,
                'task_assignment_id' => $assignment->id,
                'employee_id' => $employee->id,
                'progress_percent' => $validated['progress_percent'],
                'note' => $validated['note'],
            ]);

            // Update average task progress
            $avgProgress = (int) round($task->assignments()->avg('progress_percent'));
            $task->update(['progress_percent' => $avgProgress]);

            ActivityLog::record(
                'TASK',
                'PROGRESS_UPDATE',
                "Karyawan {$request->user()->name} memperbarui progres tugas {$task->task_code} menjadi {$validated['progress_percent']}%",
                $task->id,
                ['progress' => $validated['progress_percent']],
                $request->user()->id
            );
        });

        return back()->with('success', 'Pembaruan progres berhasil disimpan.');
    }
}
