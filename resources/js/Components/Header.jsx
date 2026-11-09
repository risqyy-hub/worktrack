import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Bell, User, Calendar } from 'lucide-react';

export default function Header({ onOpenSidebar, title, subtitle }) {
    const { auth, company } = usePage().props;
    const user = auth?.user;
    const isGM = user?.role === 'gm';

    const todayFormatted = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between transition-all">
            {/* Left: Mobile hamburger & Page Title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                    type="button"
                    onClick={onOpenSidebar}
                    className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -ml-1"
                    aria-label="Buka menu navigasi"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div>
                    <h1 className="text-base sm:text-xl font-bold text-[#142B49] truncate leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs text-slate-500 hidden sm:block mt-0.5 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Right: Date, Notifications, User info */}
            <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Date indicator for desktop */}
                <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{todayFormatted}</span>
                </div>

                {/* Notifications Button */}
                <Link
                    href="/notifications"
                    className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Notifikasi"
                >
                    <Bell className="w-5 h-5" />
                    {auth?.unread_notifications_count > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                    )}
                </Link>

                {/* Profile Pill */}
                <Link
                    href="/profile"
                    className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors min-h-[44px]"
                >
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs ${
                            isGM ? 'bg-[#1769E8]' : 'bg-[#7950E8]'
                        }`}
                    >
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm font-semibold text-[#142B49] hidden md:inline truncate max-w-[120px]">
                        {user?.name?.split(' ')[0]}
                    </span>
                </Link>
            </div>
        </header>
    );
}
