<?php

namespace App\Http\Controllers\GM;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\ReportReview;
use App\Models\ReportRevision;
use App\Models\Task;
use App\Models\TaskReport;
use App\Notifications\ReportReviewedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GMReportController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'ALL');
        $employeeId = $request->input('employee_id');
        $search = $request->input('search');

        $query = TaskReport::with([
            'task.category',
            'employee.user',
            'employee.department',
            'reviews.reviewer',
        ]);

        if ($status !== 'ALL') {
            $query->where('status', $status);
        }

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('report_code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('work_description', 'like', "%{$search}%")
                    ->orWhereHas('employee.user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('task', fn ($tq) => $tq->where('title', 'like', "%{$search}%"));
            });
        }

        $reports = $query->latest('submitted_at')
            ->paginate(10)
            ->withQueryString();

        $employees = Employee::with('user')->where('status', 'active')->get();

        $counts = [
            'ALL' => TaskReport::count(),
            'SUBMITTED' => TaskReport::where('status', 'SUBMITTED')->count(),
            'APPROVED' => TaskReport::where('status', 'APPROVED')->count(),
            'REVISION_REQUESTED' => TaskReport::where('status', 'REVISION_REQUESTED')->count(),
            'REJECTED' => TaskReport::where('status', 'REJECTED')->count(),
        ];

        return Inertia::render('GM/Reports/Index', [
            'reports' => $reports,
            'employees' => $employees,
            'counts' => $counts,
            'filters' => [
                'status' => $status,
                'employee_id' => $employeeId,
                'search' => $search,
            ],
        ]);
    }

    public function show(TaskReport $report): Response
    {
        $report->load([
            'task.category',
            'task.creator',
            'employee.user',
            'employee.department',
            'employee.position',
            'attachments',
            'reviews.reviewer',
            'revisions',
        ]);

        return Inertia::render('GM/Reports/Show', [
            'report' => $report,
        ]);
    }

    public function review(Request $request, TaskReport $report): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:APPROVED,REVISION_REQUESTED,REJECTED'],
            'notes' => ['required', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($report, $validated, $request) {
            $report->update(['status' => $validated['status']]);

            ReportReview::create([
                'task_report_id' => $report->id,
                'reviewer_id' => $request->user()->id,
                'status' => $validated['status'],
                'notes' => $validated['notes'],
                'reviewed_at' => now(),
            ]);

            if ($validated['status'] === 'REVISION_REQUESTED') {
                $lastRev = $report->revisions()->latest('revision_number')->first();
                $revNum = $lastRev ? ($lastRev->revision_number + 1) : 1;

                ReportRevision::create([
                    'task_report_id' => $report->id,
                    'revision_number' => $revNum,
                    'feedback_notes' => $validated['notes'],
                    'status' => 'OPEN',
                ]);

                // Update task and assignment status to REVISION
                $report->task->update(['status' => 'REVISION']);
                $report->assignment->update(['status' => 'REVISION']);
            } elseif ($validated['status'] === 'APPROVED') {
                $report->task->update([
                    'status' => 'COMPLETED',
                    'progress_percent' => 100,
                    'completed_at' => now(),
                ]);
                $report->assignment->update([
                    'status' => 'COMPLETED',
                    'progress_percent' => 100,
                    'completed_at' => now(),
                ]);
            }

            // Notify employee
            if ($report->employee && $report->employee->user) {
                $report->employee->user->notify(new ReportReviewedNotification(
                    $report,
                    $validated['status'],
                    $validated['notes']
                ));
            }

            ActivityLog::record(
                'REPORT',
                'REVIEW',
                "GM mereview laporan {$report->report_code} ({$report->title}) dengan status {$validated['status']}",
                $report->id,
                ['status' => $validated['status']],
                $request->user()->id
            );
        });

        return back()->with('success', 'Hasil review laporan berhasil disimpan.');
    }
}
