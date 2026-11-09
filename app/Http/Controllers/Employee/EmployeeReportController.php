<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ReportAttachment;
use App\Models\TaskAssignment;
use App\Models\TaskReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeReportController extends Controller
{
    public function index(Request $request): Response
    {
        $employee = $request->user()->employee;
        $status = $request->input('status', 'ALL');
        $search = $request->input('search');

        $query = TaskReport::with(['task.category', 'reviews.reviewer', 'revisions'])
            ->where('employee_id', $employee->id);

        if ($status !== 'ALL') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('report_code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('work_description', 'like', "%{$search}%")
                    ->orWhereHas('task', fn ($tq) => $tq->where('title', 'like', "%{$search}%"));
            });
        }

        $reports = $query->latest('submitted_at')->paginate(10)->withQueryString();

        // Active assignments that can have reports submitted
        $eligibleAssignments = TaskAssignment::with('task')
            ->where('employee_id', $employee->id)
            ->whereNotIn('status', ['COMPLETED', 'CANCELLED'])
            ->get();

        $counts = [
            'ALL' => TaskReport::where('employee_id', $employee->id)->count(),
            'SUBMITTED' => TaskReport::where('employee_id', $employee->id)->where('status', 'SUBMITTED')->count(),
            'APPROVED' => TaskReport::where('employee_id', $employee->id)->where('status', 'APPROVED')->count(),
            'REVISION_REQUESTED' => TaskReport::where('employee_id', $employee->id)->where('status', 'REVISION_REQUESTED')->count(),
            'REJECTED' => TaskReport::where('employee_id', $employee->id)->where('status', 'REJECTED')->count(),
        ];

        return Inertia::render('Employee/Reports/Index', [
            'reports' => $reports,
            'eligibleAssignments' => $eligibleAssignments,
            'counts' => $counts,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $employee = $request->user()->employee;

        $validated = $request->validate([
            'task_assignment_id' => ['required', 'exists:task_assignments,id'],
            'title' => ['required', 'string', 'max:255'],
            'work_description' => ['required', 'string'],
            'result_summary' => ['nullable', 'string'],
            'obstacles' => ['nullable', 'string'],
            'progress_percent' => ['required', 'integer', 'min:1', 'max:100'],
            'attachments.*' => ['nullable', 'file', 'max:10240'],
        ]);

        $assignment = TaskAssignment::where('id', $validated['task_assignment_id'])
            ->where('employee_id', $employee->id)
            ->firstOrFail();

        $report = DB::transaction(function () use ($validated, $assignment, $employee, $request) {
            $lastReport = TaskReport::latest('id')->first();
            $nextNum = $lastReport ? ($lastReport->id + 1) : 1;
            $reportCode = 'RPT-'.date('Y').'-'.str_pad((string) $nextNum, 3, '0', STR_PAD_LEFT);

            $report = TaskReport::create([
                'report_code' => $reportCode,
                'task_id' => $assignment->task_id,
                'task_assignment_id' => $assignment->id,
                'employee_id' => $employee->id,
                'title' => $validated['title'],
                'work_description' => $validated['work_description'],
                'result_summary' => $validated['result_summary'] ?? null,
                'obstacles' => $validated['obstacles'] ?? null,
                'progress_percent' => $validated['progress_percent'],
                'status' => 'SUBMITTED',
                'submitted_at' => now(),
            ]);

            // Update assignment & task status to IN_REVIEW
            $assignment->update([
                'status' => 'IN_REVIEW',
                'progress_percent' => $validated['progress_percent'],
            ]);

            $assignment->task->update([
                'status' => 'IN_REVIEW',
                'progress_percent' => $validated['progress_percent'],
            ]);

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('report-attachments', 'public');
                    ReportAttachment::create([
                        'task_report_id' => $report->id,
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_size' => $file->getSize(),
                        'file_type' => $file->getClientMimeType(),
                    ]);
                }
            }

            ActivityLog::record(
                'REPORT',
                'SUBMIT',
                "Karyawan {$request->user()->name} mengirim laporan pekerjaan: {$report->title} ({$reportCode})",
                $report->id,
                [],
                $request->user()->id
            );

            return $report;
        });

        return back()->with('success', "Laporan pekerjaan {$report->report_code} berhasil dikirim untuk direview GM.");
    }

    public function show(Request $request, TaskReport $report): Response
    {
        $employee = $request->user()->employee;

        if ($report->employee_id !== $employee->id) {
            abort(403, 'Anda tidak memiliki hak akses untuk laporan ini.');
        }

        $report->load([
            'task.category',
            'task.creator',
            'attachments',
            'reviews.reviewer',
            'revisions',
        ]);

        return Inertia::render('Employee/Reports/Show', [
            'report' => $report,
        ]);
    }

    public function respondRevision(Request $request, TaskReport $report): RedirectResponse
    {
        $employee = $request->user()->employee;

        if ($report->employee_id !== $employee->id) {
            abort(403);
        }

        $validated = $request->validate([
            'response' => ['required', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($report, $validated, $request) {
            $latestRevision = $report->revisions()->where('status', 'OPEN')->latest()->first();

            if ($latestRevision) {
                $latestRevision->update([
                    'employee_response' => $validated['response'],
                    'status' => 'RESOLVED',
                    'resolved_at' => now(),
                ]);
            }

            // Put report back to SUBMITTED for GM re-review
            $report->update(['status' => 'SUBMITTED']);
            $report->task->update(['status' => 'IN_REVIEW']);
            $report->assignment->update(['status' => 'IN_REVIEW']);

            ActivityLog::record(
                'REPORT',
                'REVISION_RESPONSE',
                "Karyawan {$request->user()->name} menanggapi revisi pada laporan {$report->report_code}",
                $report->id,
                [],
                $request->user()->id
            );
        });

        return back()->with('success', 'Tanggapan revisi berhasil dikirimkan kepada General Manager.');
    }
}
