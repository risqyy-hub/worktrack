<?php

namespace App\Http\Controllers\GM;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CompanySetting;
use App\Models\Department;
use App\Models\Position;
use App\Models\TaskCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GMMasterDataController extends Controller
{
    public function index(): Response
    {
        $departments = Department::withCount('employees')->with('positions')->get();
        $positions = Position::with('department')->withCount('employees')->get();
        $categories = TaskCategory::withCount('tasks')->get();

        $settings = [
            'company_name' => CompanySetting::get('company_name', 'PT WorkTrack Solusi Nusantara'),
            'company_tagline' => CompanySetting::get('company_tagline', 'Operational Platform'),
            'company_email' => CompanySetting::get('company_email', 'contact@worktrack.co.id'),
            'company_phone' => CompanySetting::get('company_phone', '+62 21 5567 8899'),
            'company_address' => CompanySetting::get('company_address', 'Jl. Jenderal Sudirman Kav. 52-53, Jakarta Selatan'),
            'currency_code' => CompanySetting::get('currency_code', 'IDR'),
            'currency_symbol' => CompanySetting::get('currency_symbol', 'Rp'),
            'timezone' => CompanySetting::get('timezone', 'Asia/Jakarta'),
        ];

        return Inertia::render('GM/MasterData/Index', [
            'departments' => $departments,
            'positions' => $positions,
            'categories' => $categories,
            'settings' => $settings,
        ]);
    }

    public function storeDepartment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:departments,name'],
            'code' => ['required', 'string', 'max:20', 'unique:departments,code'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $dept = Department::create($validated);

        ActivityLog::record('MASTER', 'CREATE_DEPT', "GM menambahkan divisi {$dept->name} ({$dept->code})", $dept->id);

        return back()->with('success', 'Divisi baru berhasil ditambahkan.');
    }

    public function updateDepartment(Request $request, Department $department): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:departments,name,'.$department->id],
            'code' => ['required', 'string', 'max:20', 'unique:departments,code,'.$department->id],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $department->update($validated);

        ActivityLog::record('MASTER', 'UPDATE_DEPT', "GM memperbarui divisi {$department->name}", $department->id);

        return back()->with('success', 'Data divisi berhasil diperbarui.');
    }

    public function storePosition(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'base_salary' => ['required', 'numeric', 'min:0'],
        ]);

        $pos = Position::create($validated);

        ActivityLog::record('MASTER', 'CREATE_POS', "GM menambahkan jabatan {$pos->name}", $pos->id);

        return back()->with('success', 'Jabatan baru berhasil ditambahkan.');
    }

    public function updatePosition(Request $request, Position $position): RedirectResponse
    {
        $validated = $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'base_salary' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        $position->update($validated);

        ActivityLog::record('MASTER', 'UPDATE_POS', "GM memperbarui jabatan {$position->name}", $position->id);

        return back()->with('success', 'Data jabatan berhasil diperbarui.');
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:task_categories,name'],
            'color' => ['required', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $cat = TaskCategory::create($validated);

        ActivityLog::record('MASTER', 'CREATE_CAT', "GM menambahkan kategori tugas {$cat->name}", $cat->id);

        return back()->with('success', 'Kategori tugas berhasil ditambahkan.');
    }

    public function updateCategory(Request $request, TaskCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:task_categories,name,'.$category->id],
            'color' => ['required', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $category->update($validated);

        ActivityLog::record('MASTER', 'UPDATE_CAT', "GM memperbarui kategori {$category->name}", $category->id);

        return back()->with('success', 'Kategori tugas berhasil diperbarui.');
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:150'],
            'company_tagline' => ['nullable', 'string', 'max:200'],
            'company_email' => ['required', 'email'],
            'company_phone' => ['nullable', 'string', 'max:50'],
            'company_address' => ['nullable', 'string', 'max:500'],
            'currency_code' => ['required', 'string', 'max:10'],
            'currency_symbol' => ['required', 'string', 'max:10'],
            'timezone' => ['required', 'string', 'max:50'],
        ]);

        foreach ($validated as $key => $val) {
            CompanySetting::set($key, $val);
        }

        ActivityLog::record('MASTER', 'UPDATE_SETTINGS', 'GM memperbarui konfigurasi perusahaan');

        return back()->with('success', 'Pengaturan sistem perusahaan berhasil disimpan.');
    }
}
