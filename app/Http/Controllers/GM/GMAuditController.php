<?php

namespace App\Http\Controllers\GM;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GMAuditController extends Controller
{
    public function index(Request $request): Response
    {
        $module = $request->input('module');
        $action = $request->input('action');
        $search = $request->input('search');

        $query = ActivityLog::with('user');

        if ($module) {
            $query->where('module', $module);
        }

        if ($action) {
            $query->where('action', $action);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
            });
        }

        $logs = $query->latest('created_at')->paginate(20)->withQueryString();

        $modules = ActivityLog::distinct()->pluck('module')->filter()->values();
        $actions = ActivityLog::distinct()->pluck('action')->filter()->values();

        return Inertia::render('GM/AuditLogs/Index', [
            'logs' => $logs,
            'modules' => $modules,
            'actions' => $actions,
            'filters' => [
                'module' => $module,
                'action' => $action,
                'search' => $search,
            ],
        ]);
    }
}
