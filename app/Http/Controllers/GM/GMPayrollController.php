<?php

namespace App\Http\Controllers\GM;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollItem;
use App\Models\PayrollPayment;
use App\Models\PayrollPeriod;
use App\Notifications\PayrollPaidNotification;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GMPayrollController extends Controller
{
    public function index(Request $request): Response
    {
        $periodId = $request->input('period_id');
        $status = $request->input('status');
        $search = $request->input('search');

        $periods = PayrollPeriod::latest('start_date')->get();
        $selectedPeriod = $periodId
            ? PayrollPeriod::find($periodId)
            : $periods->first();

        $query = Payroll::with(['employee.user', 'employee.department', 'employee.position', 'period']);

        if ($selectedPeriod) {
            $query->where('payroll_period_id', $selectedPeriod->id);
        }

        if ($status) {
            $query->where('payment_status', $status);
        }

        if ($search) {
            $query->whereHas('employee.user', function ($uq) use ($search) {
                $uq->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('reference_number', 'like', "%{$search}%");
        }

        $payrolls = $query->paginate(15)->withQueryString();

        // Summary calculations
        $totalExpense = $selectedPeriod ? (float) Payroll::where('payroll_period_id', $selectedPeriod->id)->sum('net_salary') : 0;
        $totalPaid = $selectedPeriod ? (float) Payroll::where('payroll_period_id', $selectedPeriod->id)->where('payment_status', 'PAID')->sum('net_salary') : 0;
        $totalPending = $selectedPeriod ? (float) Payroll::where('payroll_period_id', $selectedPeriod->id)->whereIn('payment_status', ['DRAFT', 'PENDING'])->sum('net_salary') : 0;
        $countPaid = $selectedPeriod ? Payroll::where('payroll_period_id', $selectedPeriod->id)->where('payment_status', 'PAID')->count() : 0;
        $countPending = $selectedPeriod ? Payroll::where('payroll_period_id', $selectedPeriod->id)->whereIn('payment_status', ['DRAFT', 'PENDING'])->count() : 0;

        return Inertia::render('GM/Payrolls/Index', [
            'payrolls' => $payrolls,
            'periods' => $periods,
            'selectedPeriod' => $selectedPeriod,
            'summary' => [
                'totalExpense' => $totalExpense,
                'totalPaid' => $totalPaid,
                'totalPending' => $totalPending,
                'countPaid' => $countPaid,
                'countPending' => $countPending,
            ],
            'filters' => [
                'period_id' => $selectedPeriod?->id,
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    public function storePeriod(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'payment_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $period = PayrollPeriod::create([
                'name' => $validated['name'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'payment_date' => $validated['payment_date'],
                'status' => 'PROCESSING',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Auto-generate draft payrolls for all active employees
            $activeEmployees = Employee::where('status', 'active')->get();
            $totalAmount = 0;

            foreach ($activeEmployees as $emp) {
                $base = (float) $emp->basic_salary;
                $allowance = 1000000; // Standar tunjangan
                $deduction = 250000; // BPJS & PPh standar
                $net = $base + $allowance - $deduction;
                $totalAmount += $net;

                $payroll = Payroll::create([
                    'payroll_period_id' => $period->id,
                    'employee_id' => $emp->id,
                    'basic_salary' => $base,
                    'total_allowance' => $allowance,
                    'total_bonus' => 0,
                    'total_deduction' => $deduction,
                    'net_salary' => $net,
                    'payment_status' => 'DRAFT',
                    'notes' => "Slip gaji {$period->name}",
                ]);

                PayrollItem::create([
                    'payroll_id' => $payroll->id,
                    'type' => 'ALLOWANCE',
                    'name' => 'Tunjangan Operasional & Makan',
                    'amount' => $allowance,
                ]);

                PayrollItem::create([
                    'payroll_id' => $payroll->id,
                    'type' => 'DEDUCTION',
                    'name' => 'BPJS & Pajak PPh 21',
                    'amount' => $deduction,
                ]);
            }

            $period->update(['total_amount' => $totalAmount]);

            ActivityLog::record(
                'PAYROLL',
                'CREATE_PERIOD',
                "GM membuat periode penggajian baru: {$period->name} untuk {$activeEmployees->count()} karyawan",
                $period->id,
                ['total_amount' => $totalAmount],
                $request->user()->id
            );
        });

        return back()->with('success', 'Periode penggajian baru berhasil dibuat dan draf slip digenerate.');
    }

    public function show(Payroll $payroll): Response
    {
        $payroll->load([
            'period',
            'employee.user',
            'employee.department',
            'employee.position',
            'items',
            'payment.recordedBy',
        ]);

        return Inertia::render('GM/Payrolls/Show', [
            'payroll' => $payroll,
        ]);
    }

    public function addItem(Request $request, Payroll $payroll): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:ALLOWANCE,BONUS,DEDUCTION'],
            'name' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($payroll, $validated, $request) {
            PayrollItem::create([
                'payroll_id' => $payroll->id,
                'type' => $validated['type'],
                'name' => $validated['name'],
                'amount' => $validated['amount'],
                'note' => $validated['note'] ?? null,
            ]);

            $this->recalculatePayroll($payroll);

            ActivityLog::record(
                'PAYROLL',
                'ADD_ITEM',
                "GM menambahkan item {$validated['type']} ({$validated['name']}) ke slip {$payroll->employee->user->name}",
                $payroll->id,
                ['amount' => $validated['amount']],
                $request->user()->id
            );
        });

        return back()->with('success', 'Item penggajian berhasil ditambahkan.');
    }

    public function deleteItem(Request $request, PayrollItem $item): RedirectResponse
    {
        $payroll = $item->payroll;

        DB::transaction(function () use ($item, $payroll, $request) {
            $name = $item->name;
            $item->delete();
            $this->recalculatePayroll($payroll);

            ActivityLog::record(
                'PAYROLL',
                'DELETE_ITEM',
                "GM menghapus item {$name} dari slip {$payroll->employee->user->name}",
                $payroll->id,
                [],
                $request->user()->id
            );
        });

        return back()->with('success', 'Item penggajian berhasil dihapus.');
    }

    public function pay(Request $request, Payroll $payroll): RedirectResponse
    {
        $validated = $request->validate([
            'payment_method' => ['required', 'string', 'max:50'],
            'payment_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($payroll, $validated, $request) {
            $refNumber = 'TRX-'.date('Ymd').'-'.str_pad((string) $payroll->id, 4, '0', STR_PAD_LEFT);

            $payroll->update([
                'payment_status' => 'PAID',
                'payment_method' => $validated['payment_method'],
                'reference_number' => $refNumber,
                'paid_at' => Carbon::parse($validated['payment_date'])->setTimeFrom(now()),
                'notes' => $validated['notes'] ?? $payroll->notes,
            ]);

            PayrollPayment::updateOrCreate(
                ['payroll_id' => $payroll->id],
                [
                    'reference_number' => $refNumber,
                    'payment_method' => $validated['payment_method'],
                    'payment_date' => $validated['payment_date'],
                    'amount' => $payroll->net_salary,
                    'status' => 'SUCCESS',
                    'notes' => $validated['notes'] ?? 'Dikonfirmasi secara manual oleh GM.',
                    'recorded_by_user_id' => $request->user()->id,
                ]
            );

            // Notify employee
            if ($payroll->employee && $payroll->employee->user) {
                $payroll->employee->user->notify(new PayrollPaidNotification($payroll));
            }

            ActivityLog::record(
                'PAYROLL',
                'PAY',
                "GM mencatat pembayaran gaji {$payroll->employee->user->name} ({$refNumber}) sebesar Rp ".number_format((float) $payroll->net_salary, 0, ',', '.'),
                $payroll->id,
                ['ref' => $refNumber, 'net' => $payroll->net_salary],
                $request->user()->id
            );
        });

        return back()->with('success', 'Pembayaran gaji berhasil dicatat dan slip resmi telah diterbitkan.');
    }

    public function printSlip(Payroll $payroll): Response
    {
        $payroll->load([
            'period',
            'employee.user',
            'employee.department',
            'employee.position',
            'items',
            'payment.recordedBy',
        ]);

        return Inertia::render('GM/Payrolls/PrintSlip', [
            'payroll' => $payroll,
        ]);
    }

    private function recalculatePayroll(Payroll $payroll): void
    {
        $items = $payroll->items()->get();

        $allowance = (float) $items->where('type', 'ALLOWANCE')->sum('amount');
        $bonus = (float) $items->where('type', 'BONUS')->sum('amount');
        $deduction = (float) $items->where('type', 'DEDUCTION')->sum('amount');
        $net = (float) $payroll->basic_salary + $allowance + $bonus - $deduction;

        $payroll->update([
            'total_allowance' => $allowance,
            'total_bonus' => $bonus,
            'total_deduction' => $deduction,
            'net_salary' => $net,
        ]);
    }
}
