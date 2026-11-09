<?php

namespace App\Http\Controllers\GM;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\TaskAttachment;
use App\Models\TaskCategory;
use App\Notifications\NewTaskAssignedNotification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GMTaskController extends Controller
{
    public function index(Request $request): Response
    {
        $statusTab = $request->input('status', 'ALL');
        $priority = $request->input('priority');
        $categoryId = $request->input('category_id');
        $search = $request->input('search');
        $today = Carbon::today();

        $query = Task::with(['category', 'creator', 'assignments.employee.user']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('task_code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($priority) {
            $query->where('priority', $priority);
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($statusTab === 'OVERDUE') {
            $query->whereNotIn('status', ['COMPLETED', 'CANCELLED'])
                ->whereDate('due_date', '<', $today);
        } elseif ($statusTab !== 'ALL') {
            $query->where('status', $statusTab);
        }

        $tasks = $query->orderBy('due_date', 'asc')
            ->paginate(10)
            ->withQueryString();

        $categories = TaskCategory::where('is_active', true)->get();

        // Count tabs
        $counts = [
            'ALL' => Task::count(),
            'UPCOMING' => Task::where('status', 'UPCOMING')->count(),
            'TODO' => Task::where('status', 'TODO')->count(),
            'IN_PROGRESS' => Task::where('status', 'IN_PROGRESS')->count(),
            'IN_REVIEW' => Task::where('status', 'IN_REVIEW')->count(),
            'COMPLETED' => Task::where('status', 'COMPLETED')->count(),
            'OVERDUE' => Task::whereNotIn('status', ['COMPLETED', 'CANCELLED'])->whereDate('due_date', '<', $today)->count(),
            'CANCELLED' => Task::where('status', 'CANCELLED')->count(),
        ];

        return Inertia::render('GM/Tasks/Index', [
            'tasks' => $tasks,
            'categories' => $categories,
            'counts' => $counts,
            'filters' => [
                'status' => $statusTab,
                'priority' => $priority,
                'category_id' => $categoryId,
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['required', 'exists:task_categories,id'],
            'priority' => ['required', 'in:LOW,MEDIUM,HIGH,URGENT'],
            'start_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:start_date'],
            'additional_instructions' => ['nullable', 'string'],
            'employee_ids' => ['required', 'array', 'min:1'],
            'employee_ids.*' => ['exists:employees,id'],
            'attachments.*' => ['nullable', 'file', 'max:10240'], // 10MB per file
        ]);

        $task = DB::transaction(function () use ($validated, $request) {
            $lastTask = Task::latest('id')->first();
            $nextNum = $lastTask ? ($lastTask->id + 1) : 1;
            $taskCode = 'TSK-'.date('Y').'-'.str_pad((string) $nextNum, 3, '0', STR_PAD_LEFT);

            $startDate = Carbon::parse($validated['start_date']);
            $initialStatus = $startDate->isFuture() && ! $startDate->isToday() ? 'UPCOMING' : 'TODO';

            $task = Task::create([
                'task_code' => $taskCode,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'category_id' => $validated['category_id'],
                'priority' => $validated['priority'],
                'status' => $initialStatus,
                'start_date' => $validated['start_date'],
                'due_date' => $validated['due_date'],
                'created_by_user_id' => $request->user()->id,
                'additional_instructions' => $validated['additional_instructions'] ?? null,
                'progress_percent' => 0,
            ]);

            foreach ($validated['employee_ids'] as $empId) {
                TaskAssignment::create([
                    'task_id' => $task->id,
                    'employee_id' => $empId,
                    'status' => $initialStatus,
                    'progress_percent' => 0,
                    'assigned_at' => now(),
                ]);

                // Notify assigned employee
                $employee = Employee::with('user')->find($empId);
                if ($employee && $employee->user) {
                    $employee->user->notify(new NewTaskAssignedNotification($task));
                }
            }

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('task-attachments', 'public');
                    TaskAttachment::create([
                        'task_id' => $task->id,
                        'user_id' => $request->user()->id,
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_size' => $file->getSize(),
                        'file_type' => $file->getClientMimeType(),
                    ]);
                }
            }

            ActivityLog::record(
                'TASK',
                'CREATE',
                "GM membuat tugas baru: {$task->title} ({$taskCode}) untuk ".count($validated['employee_ids']).' karyawan',
                $task->id,
                ['priority' => $task->priority, 'due_date' => $task->due_date->toDateString()],
                $request->user()->id
            );

            return $task;
        });

        return back()->with('success', "Tugas {$task->task_code} berhasil didelegasikan.");
    }

    public function show(Task $task): Response
    {
        $task->load([
            'category',
            'creator',
            'assignments.employee.user',
            'assignments.employee.department',
            'assignments.employee.position',
            'progresses.employee.user',
            'reports.employee.user',
            'reports.reviews.reviewer',
            'reports.revisions',
            'attachments',
        ]);

        return Inertia::render('GM/Tasks/Show', [
            'task' => $task,
        ]);
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['required', 'exists:task_categories,id'],
            'priority' => ['required', 'in:LOW,MEDIUM,HIGH,URGENT'],
            'start_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:start_date'],
            'additional_instructions' => ['nullable', 'string'],
        ]);

        $task->update($validated);

        ActivityLog::record(
            'TASK',
            'UPDATE',
            "GM memperbarui detail tugas {$task->title} ({$task->task_code})",
            $task->id,
            [],
            $request->user()->id
        );

        return back()->with('success', 'Detail tugas berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:UPCOMING,TODO,IN_PROGRESS,IN_REVIEW,REVISION,COMPLETED,CANCELLED'],
        ]);

        $task->update([
            'status' => $validated['status'],
            'completed_at' => $validated['status'] === 'COMPLETED' ? now() : null,
            'progress_percent' => $validated['status'] === 'COMPLETED' ? 100 : $task->progress_percent,
        ]);

        // Synchronize assignments
        $assignmentUpdates = ['status' => $validated['status']];
        if ($validated['status'] === 'COMPLETED') {
            $assignmentUpdates['progress_percent'] = 100;
        }
        $task->assignments()->update($assignmentUpdates);

        ActivityLog::record(
            'TASK',
            'STATUS_CHANGE',
            "GM mengubah status tugas {$task->task_code} menjadi {$validated['status']}",
            $task->id,
            ['new_status' => $validated['status']],
            $request->user()->id
        );

        return back()->with('success', "Status tugas diubah menjadi {$validated['status']}.");
    }

    public function searchEmployees(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        $employees = Employee::with(['user', 'department', 'position'])
            ->where('status', 'active')
            ->where(function ($q) use ($query) {
                $q->where('employee_code', 'like', "%{$query}%")
                    ->orWhereHas('user', function ($uq) use ($query) {
                        $uq->where('name', 'like', "%{$query}%")
                            ->orWhere('email', 'like', "%{$query}%");
                    });
            })
            ->limit(10)
            ->get()
            ->map(function ($emp) {
                return [
                    'id' => $emp->id,
                    'code' => $emp->employee_code,
                    'name' => $emp->user->name,
                    'email' => $emp->user->email,
                    'department' => $emp->department ? $emp->department->name : '-',
                    'position' => $emp->position ? $emp->position->name : '-',
                    'avatar' => $emp->user->avatar,
                ];
            });

        return response()->json($employees);
    }

    public function destroy(Request $request, Task $task): RedirectResponse
    {
        $taskCode = $task->task_code;
        $task->delete();

        ActivityLog::record(
            'TASK',
            'DELETE',
            "GM menghapus tugas {$taskCode}",
            $task->id,
            [],
            $request->user()->id
        );

        return redirect()->route('gm.tasks.index')->with('success', "Tugas {$taskCode} berhasil dihapus.");
    }
}
