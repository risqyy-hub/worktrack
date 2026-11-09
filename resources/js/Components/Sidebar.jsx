import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    CheckSquare,
    FileText,
    Banknote,
    Database,
    ShieldAlert,
    BookOpen,
    UserCheck,
    Bell,
    User,
    LogOut,
    X,
    Briefcase,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
    const { auth, company } = usePage().props;
    const user = auth?.user;
    const isGM = user?.role === 'gm';
    const currentUrl = usePage().url;

    const gmNavItems = [
        { name: 'Dashboard Monitoring', href: '/gm/dashboard', icon: LayoutDashboard },
        { name: 'Manajemen Karyawan', href: '/gm/employees', icon: Users },
        { name: 'Delegasi Tugas', href: '/gm/tasks', icon: CheckSquare },
        { name: 'Laporan Pekerjaan', href: '/gm/reports', icon: FileText },
        { name: 'Penggajian', href: '/gm/payrolls', icon: Banknote },
        { name: 'Master Data', href: '/gm/master-data', icon: Database },
        { name: 'Audit Aktivitas', href: '/gm/audit-logs', icon: ShieldAlert },
    ];

    const employeeNavItems = [
        { name: 'Dashboard Overview', href: '/employee/dashboard', icon: LayoutDashboard },
        { name: 'Tugas Saya', href: '/employee/tasks', icon: CheckSquare },
        { name: 'Laporan Saya', href: '/employee/reports', icon: FileText },
        { name: 'Catatan Pribadi', href: '/employee/notes', icon: BookOpen },
        { name: 'Gaji Saya', href: '/employee/payrolls', icon: Banknote },
    ];

    const navItems = isGM ? gmNavItems : employeeNavItems;

    const activeBgClass = isGM ? 'bg-[#1769E8] text-white shadow-md' : 'bg-[#7950E8] text-white shadow-md';
    const activeIconClass = 'text-white';
    const inactiveClass = 'text-slate-300 hover:text-white hover:bg-[#1F3C64] transition-colors';

    return (
        <>
            {/* Mobile Drawer Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-40 w-64 sm:w-72 bg-[#142B49] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header Logo */}
                <div className="h-18 px-6 flex items-center justify-between border-b border-[#1F3C64]/70 shrink-0">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white shadow-lg ${
                                isGM ? 'bg-[#1769E8]' : 'bg-[#7950E8]'
                            }`}
                        >
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-extrabold text-lg tracking-tight text-white block">
                                Work<span className={isGM ? 'text-[#38BDF8]' : 'text-[#C084FC]'}>Track</span>
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
                                {isGM ? 'General Manager' : 'Employee Portal'}
                            </span>
                        </div>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1F3C64] transition-colors"
                        aria-label="Tutup navigasi"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info Card */}
                <div className="p-4 mx-4 my-3 bg-[#0F1F35] rounded-xl border border-[#1F3C64]/50 shrink-0">
                    <div className="flex items-center space-x-3">
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                                isGM ? 'bg-[#1769E8]' : 'bg-[#7950E8]'
                            }`}
                        >
                            {user?.avatar ? (
                                <img
                                    src={`/storage/${user.avatar}`}
                                    alt={user.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                (user?.name || 'U').charAt(0)
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate leading-tight">
                                {user?.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {user?.email}
                            </p>
                            <span
                                className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md mt-1 ${
                                    isGM ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                                }`}
                            >
                                {isGM ? 'General Manager' : (user?.employee?.position?.name || 'Karyawan')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
                        Navigasi Utama
                    </div>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentUrl === item.href || currentUrl.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px] ${
                                    isActive ? activeBgClass : inactiveClass
                                }`}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${isActive ? activeIconClass : 'text-slate-400'}`} />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-4 pb-2">
                        Akun & Utilitas
                    </div>

                    <Link
                        href="/profile"
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                            currentUrl.startsWith('/profile') ? activeBgClass : inactiveClass
                        }`}
                    >
                        <User className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="truncate">Profil Saya</span>
                    </Link>

                    <Link
                        href="/notifications"
                        onClick={onClose}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                            currentUrl.startsWith('/notifications') ? activeBgClass : inactiveClass
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <Bell className="w-5 h-5 text-slate-400 shrink-0" />
                            <span className="truncate">Notifikasi</span>
                        </div>
                        {auth?.unread_notifications_count > 0 && (
                            <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                                {auth.unread_notifications_count}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Footer Logout */}
                <div className="p-4 border-t border-[#1F3C64]/70 shrink-0 pb-safe">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-rose-600/80 transition-colors min-h-[44px]"
                    >
                        <LogOut className="w-5 h-5 text-slate-400 hover:text-white shrink-0" />
                        <span>Keluar Sistem</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
