<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeePayrollController extends Controller
{
    public function index(Request $request): Response
    {
        $employee = $request->user()->employee;

        $payrolls = Payroll::with(['period', 'payment'])
            ->where('employee_id', $employee->id)
            ->latest('id')
            ->paginate(10);

        return Inertia::render('Employee/Payrolls/Index', [
            'payrolls' => $payrolls,
        ]);
    }

    public function show(Request $request, Payroll $payroll): Response
    {
        $employee = $request->user()->employee;

        if ($payroll->employee_id !== $employee->id) {
            abort(403, 'Akses tidak diizinkan untuk data gaji karyawan lain.');
        }

        $payroll->load([
            'period',
            'employee.user',
            'employee.department',
            'employee.position',
            'items',
            'payment',
        ]);

        return Inertia::render('Employee/Payrolls/Show', [
            'payroll' => $payroll,
        ]);
    }

    public function printSlip(Request $request, Payroll $payroll): Response
    {
        $employee = $request->user()->employee;

        if ($payroll->employee_id !== $employee->id) {
            abort(403);
        }

        $payroll->load([
            'period',
            'employee.user',
            'employee.department',
            'employee.position',
            'items',
            'payment',
        ]);

        return Inertia::render('Employee/Payrolls/PrintSlip', [
            'payroll' => $payroll,
        ]);
    }
}
