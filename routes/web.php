<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Employee\EmployeeDashboardController;
use App\Http\Controllers\Employee\EmployeePayrollController;
use App\Http\Controllers\Employee\EmployeePersonalNoteController;
use App\Http\Controllers\Employee\EmployeeReportController;
use App\Http\Controllers\Employee\EmployeeTaskController;
use App\Http\Controllers\GM\GMAuditController;
use App\Http\Controllers\GM\GMDashboardController;
use App\Http\Controllers\GM\GMEmployeeController;
use App\Http\Controllers\GM\GMExportController;
use App\Http\Controllers\GM\GMMasterDataController;
use App\Http\Controllers\GM\GMPayrollController;
use App\Http\Controllers\GM\GMReportController;
use App\Http\Controllers\GM\GMTaskController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Redirect root to dashboard or login
Route::get('/', function () {
    if (auth()->check()) {
        return auth()->user()->isGM()
            ? redirect()->route('gm.dashboard')
            : redirect()->route('employee.dashboard');
    }

    return redirect()->route('login');
});

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
});

// Authenticated shared routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});

// General Manager (GM) Protected Routes
Route::middleware(['auth', 'role.gm'])->prefix('gm')->name('gm.')->group(function () {
    Route::get('/dashboard', [GMDashboardController::class, 'index'])->name('dashboard');

    // Employee Management
    Route::get('/employees', [GMEmployeeController::class, 'index'])->name('employees.index');
    Route::post('/employees', [GMEmployeeController::class, 'store'])->name('employees.store');
    Route::get('/employees/{employee}', [GMEmployeeController::class, 'show'])->name('employees.show');
    Route::put('/employees/{employee}', [GMEmployeeController::class, 'update'])->name('employees.update');
    Route::patch('/employees/{employee}/toggle-status', [GMEmployeeController::class, 'toggleStatus'])->name('employees.toggle-status');
    Route::delete('/employees/{employee}', [GMEmployeeController::class, 'destroy'])->name('employees.destroy');

    // Task Delegation & Management
    Route::get('/tasks', [GMTaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [GMTaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/search-employees', [GMTaskController::class, 'searchEmployees'])->name('tasks.search-employees');
    Route::get('/tasks/{task}', [GMTaskController::class, 'show'])->name('tasks.show');
    Route::put('/tasks/{task}', [GMTaskController::class, 'update'])->name('tasks.update');
    Route::patch('/tasks/{task}/status', [GMTaskController::class, 'updateStatus'])->name('tasks.update-status');
    Route::delete('/tasks/{task}', [GMTaskController::class, 'destroy'])->name('tasks.destroy');

    // Report Management & Review
    Route::get('/reports', [GMReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/{report}', [GMReportController::class, 'show'])->name('reports.show');
    Route::post('/reports/{report}/review', [GMReportController::class, 'review'])->name('reports.review');

    // Payroll Management
    Route::get('/payrolls', [GMPayrollController::class, 'index'])->name('payrolls.index');
    Route::post('/payrolls/period', [GMPayrollController::class, 'storePeriod'])->name('payrolls.period.store');
    Route::get('/payrolls/{payroll}', [GMPayrollController::class, 'show'])->name('payrolls.show');
    Route::post('/payrolls/{payroll}/items', [GMPayrollController::class, 'addItem'])->name('payrolls.items.store');
    Route::delete('/payrolls/items/{item}', [GMPayrollController::class, 'deleteItem'])->name('payrolls.items.destroy');
    Route::post('/payrolls/{payroll}/pay', [GMPayrollController::class, 'pay'])->name('payrolls.pay');
    Route::get('/payrolls/{payroll}/print', [GMPayrollController::class, 'printSlip'])->name('payrolls.print');

    // Master Data
    Route::get('/master-data', [GMMasterDataController::class, 'index'])->name('master-data.index');
    Route::post('/master-data/departments', [GMMasterDataController::class, 'storeDepartment'])->name('master-data.departments.store');
    Route::put('/master-data/departments/{department}', [GMMasterDataController::class, 'updateDepartment'])->name('master-data.departments.update');
    Route::post('/master-data/positions', [GMMasterDataController::class, 'storePosition'])->name('master-data.positions.store');
    Route::put('/master-data/positions/{position}', [GMMasterDataController::class, 'updatePosition'])->name('master-data.positions.update');
    Route::post('/master-data/categories', [GMMasterDataController::class, 'storeCategory'])->name('master-data.categories.store');
    Route::put('/master-data/categories/{category}', [GMMasterDataController::class, 'updateCategory'])->name('master-data.categories.update');
    Route::put('/master-data/settings', [GMMasterDataController::class, 'updateSettings'])->name('master-data.settings.update');

    // Audit Logs
    Route::get('/audit-logs', [GMAuditController::class, 'index'])->name('audit-logs.index');

    // Exports
    Route::get('/export/employees', [GMExportController::class, 'exportEmployees'])->name('export.employees');
    Route::get('/export/tasks', [GMExportController::class, 'exportTasks'])->name('export.tasks');
    Route::get('/export/payrolls', [GMExportController::class, 'exportPayrolls'])->name('export.payrolls');
});

// Employee Protected Routes
Route::middleware(['auth', 'role.employee'])->prefix('employee')->name('employee.')->group(function () {
    Route::get('/dashboard', [EmployeeDashboardController::class, 'index'])->name('dashboard');

    // Task Management
    Route::get('/tasks', [EmployeeTaskController::class, 'index'])->name('tasks.index');
    Route::get('/tasks/{task}', [EmployeeTaskController::class, 'show'])->name('tasks.show');
    Route::post('/tasks/{task}/start', [EmployeeTaskController::class, 'start'])->name('tasks.start');
    Route::post('/tasks/{task}/progress', [EmployeeTaskController::class, 'updateProgress'])->name('tasks.progress');

    // Report Management
    Route::get('/reports', [EmployeeReportController::class, 'index'])->name('reports.index');
    Route::post('/reports', [EmployeeReportController::class, 'store'])->name('reports.store');
    Route::get('/reports/{report}', [EmployeeReportController::class, 'show'])->name('reports.show');
    Route::post('/reports/{report}/revision-response', [EmployeeReportController::class, 'respondRevision'])->name('reports.revision-response');

    // Personal Notes
    Route::get('/notes', [EmployeePersonalNoteController::class, 'index'])->name('notes.index');
    Route::post('/notes', [EmployeePersonalNoteController::class, 'store'])->name('notes.store');
    Route::put('/notes/{note}', [EmployeePersonalNoteController::class, 'update'])->name('notes.update');
    Route::patch('/notes/{note}/favorite', [EmployeePersonalNoteController::class, 'toggleFavorite'])->name('notes.favorite');
    Route::delete('/notes/{note}', [EmployeePersonalNoteController::class, 'destroy'])->name('notes.destroy');

    // Payrolls
    Route::get('/payrolls', [EmployeePayrollController::class, 'index'])->name('payrolls.index');
    Route::get('/payrolls/{payroll}', [EmployeePayrollController::class, 'show'])->name('payrolls.show');
    Route::get('/payrolls/{payroll}/print', [EmployeePayrollController::class, 'printSlip'])->name('payrolls.print');
});
