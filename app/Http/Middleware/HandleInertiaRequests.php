<?php

namespace App\Http\Middleware;

use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'employee' => $user->employee ? [
                        'id' => $user->employee->id,
                        'employee_code' => $user->employee->employee_code,
                        'department' => $user->employee->department ? [
                            'id' => $user->employee->department->id,
                            'name' => $user->employee->department->name,
                            'code' => $user->employee->department->code,
                        ] : null,
                        'position' => $user->employee->position ? [
                            'id' => $user->employee->position->id,
                            'name' => $user->employee->position->name,
                        ] : null,
                        'basic_salary' => $user->employee->basic_salary,
                        'join_date' => $user->employee->join_date?->format('d M Y'),
                    ] : null,
                ] : null,
                'unread_notifications_count' => $user ? $user->unreadNotifications()->count() : 0,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'company' => [
                'name' => CompanySetting::get('company_name', 'WorkTrack Nusantara'),
                'tagline' => CompanySetting::get('company_tagline', 'Operational Platform'),
                'currency_symbol' => CompanySetting::get('currency_symbol', 'Rp'),
            ],
        ];
    }
}
