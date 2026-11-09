import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    Save,
    Camera,
    Shield,
    Building2,
    Briefcase,
} from 'lucide-react';

export default function ProfileIndex({ profileUser }) {
    const isGM = profileUser.role === 'gm';
    const employee = profileUser.employee;

    // Profile details form
    const infoForm = useForm({
        name: profileUser.name || '',
        email: profileUser.email || '',
        phone: profileUser.phone || employee?.phone || '',
        address: employee?.address || '',
        avatar: null,
    });

    // Password form
    const passForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [avatarPreview, setAvatarPreview] = useState(
        profileUser.avatar ? `/storage/${profileUser.avatar}` : null
    );

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            infoForm.setData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleInfoSubmit = (e) => {
        e.preventDefault();
        // Since it may contain avatar file upload, use post or router.post with _method: 'PUT'
        infoForm.post('/profile', {
            _method: 'put',
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passForm.put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => passForm.reset(),
        });
    };

    return (
        <AppLayout
            title="Pengaturan Profil & Keamanan"
            subtitle="Perbarui data kontak, foto avatar, dan kata sandi akun Anda"
        >
            <Head title="Profil Akun - WorkTrack" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card: Summary & Avatar */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] text-center space-y-4">
                    <div className="relative w-28 h-28 mx-auto">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt={profileUser.name}
                                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-full bg-[#142B49] text-white font-black text-3xl flex items-center justify-center border-4 border-white shadow-md mx-auto">
                                {profileUser.name?.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        <label
                            htmlFor="avatar-upload"
                            className="absolute bottom-0 right-0 p-2 bg-[#1769E8] hover:bg-[#1255be] text-white rounded-full cursor-pointer shadow-md transition-colors"
                            title="Ganti Avatar"
                        >
                            <Camera className="w-4 h-4" />
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">{profileUser.name}</h3>
                        <span
                            className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mt-1 ${
                                isGM
                                    ? 'bg-[#1769E8]/10 text-[#1769E8]'
                                    : 'bg-[#7950E8]/10 text-[#7950E8]'
                            }`}
                        >
                            {isGM ? 'General Manager' : 'Karyawan Operasional'}
                        </span>
                    </div>

                    {employee && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-left space-y-2">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                <span>Jabatan: <strong>{employee.position?.name || '-'}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Divisi: <strong>{employee.department?.name || '-'}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Shield className="w-3.5 h-3.5 text-slate-400" />
                                <span>NIK: <strong className="font-mono">{employee.employee_code || '-'}</strong></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right 2 Cols: Profile Edit & Password Change */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Edit Profile Form */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-5">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <User className="w-5 h-5 text-[#1769E8]" />
                            <h3 className="font-bold text-slate-800 text-base">Informasi Kontak & Akun</h3>
                        </div>

                        <form onSubmit={handleInfoSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        type="text"
                                        value={infoForm.data.name}
                                        onChange={(e) => infoForm.setData('name', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                        required
                                    />
                                    {infoForm.errors.name && (
                                        <p className="text-xs text-rose-500 mt-1">{infoForm.errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                        Alamat Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={infoForm.data.email}
                                        onChange={(e) => infoForm.setData('email', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                        required
                                    />
                                    {infoForm.errors.email && (
                                        <p className="text-xs text-rose-500 mt-1">{infoForm.errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                        Nomor Telepon / WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        value={infoForm.data.phone}
                                        onChange={(e) => infoForm.setData('phone', e.target.value)}
                                        placeholder="Contoh: 08123456789"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                        Alamat Tempat Tinggal
                                    </label>
                                    <input
                                        type="text"
                                        value={infoForm.data.address}
                                        onChange={(e) => infoForm.setData('address', e.target.value)}
                                        placeholder="Kota, Alamat domisili..."
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={infoForm.processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1769E8] hover:bg-[#1255be] text-white rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-60"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{infoForm.processing ? 'Menyimpan...' : 'Simpan Profil'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-5">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <Lock className="w-5 h-5 text-slate-700" />
                            <h3 className="font-bold text-slate-800 text-base">Ubah Kata Sandi (Password)</h3>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                    Kata Sandi Saat Ini *
                                </label>
                                <input
                                    type="password"
                                    value={passForm.data.current_password}
                                    onChange={(e) => passForm.setData('current_password', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                    required
                                />
                                {passForm.errors.current_password && (
                                    <p className="text-xs text-rose-500 mt-1">{passForm.errors.current_password}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                        Kata Sandi Baru *
                                    </label>
                                    <input
                                        type="password"
                                        value={passForm.data.password}
                                        onChange={(e) => passForm.setData('password', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                        required
                                    />
                                    {passForm.errors.password && (
                                        <p className="text-xs text-rose-500 mt-1">{passForm.errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                        Konfirmasi Kata Sandi Baru *
                                    </label>
                                    <input
                                        type="password"
                                        value={passForm.data.password_confirmation}
                                        onChange={(e) => passForm.setData('password_confirmation', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={passForm.processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-60"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>{passForm.processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
