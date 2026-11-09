import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Briefcase, Lock, Mail, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    const fillDemo = (role) => {
        if (role === 'gm') {
            setData({
                email: 'gm@worktrack.com',
                password: 'password',
                remember: true,
            });
        } else {
            setData({
                email: 'fauzi@worktrack.com',
                password: 'password',
                remember: true,
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#142B49] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head title="Masuk ke Sistem - WorkTrack" />

            {/* Background Decorative Blobs */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Container Card */}
            <div className="w-full max-w-md relative z-10">
                {/* Logo & Headline */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1769E8] text-white shadow-xl shadow-blue-500/20 mb-4">
                        <Briefcase className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Work<span className="text-[#38BDF8]">Track</span>
                    </h1>
                    <p className="text-sm text-slate-300 mt-1.5">
                        Enterprise Operational & Employee Management Platform
                    </p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[#142B49]">
                            Selamat Datang Kembali
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Masukkan email dan kata sandi untuk masuk ke workspace.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@worktrack.com"
                                    required
                                    autoFocus
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8] focus:border-transparent text-base sm:text-sm transition-all"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8] focus:border-transparent text-base sm:text-sm transition-all"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center space-x-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 text-[#1769E8] border-slate-300 rounded-sm focus:ring-[#1769E8]"
                                />
                                <span className="text-xs sm:text-sm text-slate-600 font-medium select-none">
                                    Ingat saya di perangkat ini
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-2 py-3.5 px-4 bg-[#1769E8] hover:bg-[#1254B8] text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all min-h-[48px] disabled:opacity-70"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <span>Masuk ke Akun</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Accounts Helper */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-500" />
                                Akun Demo Cepat
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => fillDemo('gm')}
                                className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors text-center"
                            >
                                Masuk sbg GM
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemo('employee')}
                                className="px-3 py-2 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors text-center"
                            >
                                Masuk sbg Karyawan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer copyright */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    © 2026 PT WorkTrack Solusi Nusantara. Seluruh Hak Cipta Dilindungi.
                </p>
            </div>
        </div>
    );
}
