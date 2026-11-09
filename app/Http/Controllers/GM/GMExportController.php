<?php

namespace App\Http\Controllers\GM;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Task;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GMExportController extends Controller
{
    public function exportEmployees(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="data-karyawan-'.date('YmdHis').'.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Kode Karyawan', 'Nama Lengkap', 'Email', 'Telepon', 'Divisi', 'Jabatan', 'Status Kerja', 'Gaji Pokok', 'Tanggal Bergabung', 'Status']);

            Employee::with(['user', 'department', 'position'])->chunk(100, function ($employees) use ($handle) {
                foreach ($employees as $emp) {
                    fputcsv($handle, [
                        $emp->employee_code,
                        $emp->user->name,
                        $emp->user->email,
                        $emp->phone ?? '-',
                        $emp->department ? $emp->department->name : '-',
                        $emp->position ? $emp->position->name : '-',
                        strtoupper($emp->employment_status),
                        $emp->basic_salary,
                        $emp->join_date?->format('Y-m-d'),
                        strtoupper($emp->status),
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    public function exportTasks(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="data-tugas-'.date('YmdHis').'.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Kode Tugas', 'Judul Tugas', 'Kategori', 'Prioritas', 'Status', 'Tanggal Mulai', 'Deadline', 'Progres (%)', 'Ditugaskan Kepada']);

            Task::with(['category', 'assignments.employee.user'])->chunk(100, function ($tasks) use ($handle) {
                foreach ($tasks as $task) {
                    $assignees = $task->assignments->map(fn ($a) => $a->employee->user->name)->join(', ');
                    fputcsv($handle, [
                        $task->task_code,
                        $task->title,
                        $task->category ? $task->category->name : '-',
                        $task->priority,
                        $task->status,
                        $task->start_date?->format('Y-m-d'),
                        $task->due_date?->format('Y-m-d'),
                        $task->progress_percent.'%',
                        $assignees ?: '-',
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    public function exportPayrolls(Request $request): StreamedResponse
    {
        $periodId = $request->input('period_id');
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="rekap-penggajian-'.date('YmdHis').'.csv"',
        ];

        return response()->stream(function () use ($periodId) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Periode', 'No Referensi', 'Kode Karyawan', 'Nama Karyawan', 'Gaji Pokok', 'Tunjangan', 'Bonus', 'Potongan', 'Gaji Bersih', 'Status Pembayaran', 'Metode Pembayaran', 'Tanggal Bayar']);

            $query = Payroll::with(['employee.user', 'period']);
            if ($periodId) {
                $query->where('payroll_period_id', $periodId);
            }

            $query->chunk(100, function ($payrolls) use ($handle) {
                foreach ($payrolls as $pay) {
                    fputcsv($handle, [
                        $pay->period->name,
                        $pay->reference_number ?? '-',
                        $pay->employee->employee_code,
                        $pay->employee->user->name,
                        $pay->basic_salary,
                        $pay->total_allowance,
                        $pay->total_bonus,
                        $pay->total_deduction,
                        $pay->net_salary,
                        $pay->payment_status,
                        $pay->payment_method ?? '-',
                        $pay->paid_at?->format('Y-m-d H:i') ?? '-',
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }
}
