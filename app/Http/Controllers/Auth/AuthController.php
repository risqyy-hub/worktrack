<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return Auth::user()->isGM()
                ? redirect()->route('gm.dashboard')
                : redirect()->route('employee.dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = (bool) $request->boolean('remember');

        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => __('Email atau kata sandi yang Anda masukkan salah.'),
            ]);
        }

        $user = Auth::user();

        if ($user->status !== 'active') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => __('Akun Anda dinonaktifkan. Silakan hubungi General Manager.'),
            ]);
        }

        $request->session()->regenerate();

        $user->update(['last_login_at' => now()]);

        ActivityLog::record(
            'AUTH',
            'LOGIN',
            "Pengguna {$user->name} ({$user->role}) berhasil masuk ke sistem.",
            $user->id,
            ['ip' => $request->ip()],
            $user->id
        );

        return $user->isGM()
            ? redirect()->intended(route('gm.dashboard'))
            : redirect()->intended(route('employee.dashboard'));
    }

    public function logout(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user) {
            ActivityLog::record(
                'AUTH',
                'LOGOUT',
                "Pengguna {$user->name} keluar dari sistem.",
                $user->id,
                [],
                $user->id
            );
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Anda telah berhasil keluar.');
    }
}
