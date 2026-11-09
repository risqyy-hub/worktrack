<?php

namespace App\Http\Controllers\GM;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class GMEmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $departmentId = $request->input('department_id');
        $status = $request->input('status');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        $query = Employee::with(['user', 'department', 'position'])
            ->withCount([
                'assignments as total_tasks',
                'assignments as completed_tasks' => fn ($q) => $q->where('status', 'COMPLETED'),
                'assignments as active_tasks' => fn ($q) => $q->whereIn('status', ['TODO', 'IN_PROGRESS', 'IN_REVIEW']),
            ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('employee_code', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $employees = $query->orderBy($sortBy, $sortOrder)
            ->paginate(10)
            ->withQueryString();

        $departments = Department::where('is_active', true)->with('positions')->get();

        return Inertia::render('GM/Employees/Index', [
            'employees' => $employees,
            'departments' => $departments,
            'filters' => [
                'search' => $search,
                'department_id' => $departmentId,
                'status' => $status,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:30'],
            'department_id' => ['required', 'exists:departments,id'],
            'position_id' => ['required', 'exists:positions,id'],
            'gender' => ['nullable', 'in:male,female'],
            'address' => ['nullable', 'string', 'max:500'],
            'join_date' => ['required', 'date'],
            'employment_status' => ['required', 'in:permanent,contract,probation,internship'],
            'basic_salary' => ['required', 'numeric', 'min:0'],
            'bank_name' => ['nullable', 'string', 'max:50'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_account_holder' => ['nullable', 'string', 'max:100'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password'] ?? 'password'),
                'role' => 'employee',
                'phone' => $validated['phone'] ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $lastEmp = Employee::latest('id')->first();
            $nextNum = $lastEmp ? ($lastEmp->id + 1) : 1;
            $code = 'EMP-'.date('Y').'-'.str_pad((string) $nextNum, 3, '0', STR_PAD_LEFT);

            $employee = Employee::create([
                'user_id' => $user->id,
                'employee_code' => $code,
                'department_id' => $validated['department_id'],
                'position_id' => $validated['position_id'],
                'phone' => $validated['phone'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'address' => $validated['address'] ?? null,
                'join_date' => $validated['join_date'],
                'employment_status' => $validated['employment_status'],
                'basic_salary' => $validated['basic_salary'],
                'bank_name' => $validated['bank_name'] ?? null,
                'bank_account_number' => $validated['bank_account_number'] ?? null,
                'bank_account_holder' => $validated['bank_account_holder'] ?? $validated['name'],
                'status' => 'active',
            ]);

            ActivityLog::record(
                'EMPLOYEE',
                'CREATE',
                "GM menambahkan karyawan baru: {$user->name} ({$code})",
                $employee->id,
                ['email' => $user->email],
                $request->user()->id
            );
        });

        return back()->with('success', 'Karyawan baru berhasil ditambahkan.');
    }

    public function show(Employee $employee): Response
    {
        $employee->load([
            'user',
            'department',
            'position',
            'assignments.task.category',
            'taskReports.task',
            'payrolls.period',
        ]);

        $today = Carbon::today();
        $totalAssigned = $employee->assignments->count();
        $completedCount = $employee->assignments->where('status', 'COMPLETED')->count();
        $inProgressCount = $employee->assignments->where('status', 'IN_PROGRESS')->count();
        $overdueCount = $employee->assignments->filter(function ($a) {
            return $a->task && $a->task->due_date && Carbon::parse($a->task->due_date)->isPast() && ! in_array($a->status, ['COMPLETED', 'CANCELLED']);
        })->count();

        $productivityRate = $totalAssigned > 0 ? round(($completedCount / $totalAssigned) * 100) : 0;

        return Inertia::render('GM/Employees/Show', [
            'employee' => $employee,
            'stats' => [
                'totalAssigned' => $totalAssigned,
                'completedCount' => $completedCount,
                'inProgressCount' => $inProgressCount,
                'overdueCount' => $overdueCount,
                'productivityRate' => $productivityRate,
            ],
        ]);
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$employee->user_id],
            'phone' => ['nullable', 'string', 'max:30'],
            'department_id' => ['required', 'exists:departments,id'],
            'position_id' => ['required', 'exists:positions,id'],
            'gender' => ['nullable', 'in:male,female'],
            'address' => ['nullable', 'string', 'max:500'],
            'join_date' => ['required', 'date'],
            'employment_status' => ['required', 'in:permanent,contract,probation,internship'],
            'basic_salary' => ['required', 'numeric', 'min:0'],
            'bank_name' => ['nullable', 'string', 'max:50'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_account_holder' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        DB::transaction(function () use ($validated, $employee, $request) {
            $employee->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'status' => $validated['status'],
            ]);

            $employee->update([
                'department_id' => $validated['department_id'],
                'position_id' => $validated['position_id'],
                'phone' => $validated['phone'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'address' => $validated['address'] ?? null,
                'join_date' => $validated['join_date'],
                'employment_status' => $validated['employment_status'],
                'basic_salary' => $validated['basic_salary'],
                'bank_name' => $validated['bank_name'] ?? null,
                'bank_account_number' => $validated['bank_account_number'] ?? null,
                'bank_account_holder' => $validated['bank_account_holder'] ?? null,
                'status' => $validated['status'],
            ]);

            ActivityLog::record(
                'EMPLOYEE',
                'UPDATE',
                "GM memperbarui data karyawan {$employee->user->name} ({$employee->employee_code})",
                $employee->id,
                [],
                $request->user()->id
            );
        });

        return back()->with('success', 'Data karyawan berhasil diperbarui.');
    }

    public function toggleStatus(Request $request, Employee $employee): RedirectResponse
    {
        $newStatus = $employee->status === 'active' ? 'inactive' : 'active';

        DB::transaction(function () use ($employee, $newStatus, $request) {
            $employee->update(['status' => $newStatus]);
            $employee->user->update(['status' => $newStatus]);

            ActivityLog::record(
                'EMPLOYEE',
                'TOGGLE_STATUS',
                "GM mengubah status karyawan {$employee->user->name} menjadi {$newStatus}",
                $employee->id,
                ['new_status' => $newStatus],
                $request->user()->id
            );
        });

        return back()->with('success', "Status karyawan berhasil diubah menjadi {$newStatus}.");
    }

    public function destroy(Request $request, Employee $employee): RedirectResponse
    {
        DB::transaction(function () use ($employee, $request) {
            $userName = $employee->user->name;
            $employee->update(['status' => 'inactive']);
            $employee->user->update(['status' => 'inactive']);
            $employee->delete();
            $employee->user->delete();

            ActivityLog::record(
                'EMPLOYEE',
                'DELETE',
                "GM menghapus (soft delete) karyawan {$userName} ({$employee->employee_code})",
                $employee->id,
                [],
                $request->user()->id
            );
        });

        return redirect()->route('gm.employees.index')->with('success', 'Data karyawan berhasil dinonaktifkan dan dihapus.');
    }
}
