import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';
import {
    Bell,
    CheckCheck,
    CheckSquare,
    FileText,
    Banknote,
    Clock,
    ArrowRight,
    Circle,
} from 'lucide-react';

export default function NotificationsIndex({ notifications }) {
    const handleMarkAsRead = (id) => {
        router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
    };

    const handleMarkAllAsRead = () => {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'TASK_ASSIGNED':
                return <CheckSquare className="w-5 h-5 text-blue-600" />;
            case 'PAYROLL_PAID':
                return <Banknote className="w-5 h-5 text-emerald-600" />;
            case 'REPORT_REVIEWED':
                return <FileText className="w-5 h-5 text-purple-600" />;
            default:
                return <Bell className="w-5 h-5 text-slate-600" />;
        }
    };

    return (
        <AppLayout
            title="Pusat Notifikasi"
            subtitle="Pemberitahuan resmi mengenai tugas yang didelegasikan, hasil review laporan pekerjaan, dan pembayaran gaji"
        >
            <Head title="Notifikasi - WorkTrack" />

            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                    <Bell className="w-4 h-4 text-[#1769E8]" />
                    <span>Daftar Pemberitahuan ({notifications?.total || 0})</span>
                </div>

                <button
                    onClick={handleMarkAllAsRead}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                    <CheckCheck className="w-4 h-4" />
                    <span>Tandai Semua Dibaca</span>
                </button>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {notifications?.data?.length > 0 ? (
                        notifications.data.map((n) => {
                            const isUnread = !n.read_at;
                            const data = n.data || {};

                            return (
                                <div
                                    key={n.id}
                                    className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                                        isUnread ? 'bg-[#1769E8]/5' : 'hover:bg-slate-50/70'
                                    }`}
                                >
                                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                                            {getIcon(data.type)}
                                        </div>

                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold text-slate-900 text-sm">
                                                    {data.title || 'Notifikasi Sistem'}
                                                </h4>
                                                {isUnread && (
                                                    <span className="w-2 h-2 rounded-full bg-[#1769E8]" />
                                                )}
                                                <span className="text-[11px] text-slate-400 font-mono">
                                                    {new Date(n.created_at).toLocaleString('id-ID')}
                                                </span>
                                            </div>

                                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                                {data.message}
                                            </p>

                                            {data.url && (
                                                <a
                                                    href={data.url}
                                                    onClick={() => isUnread && handleMarkAsRead(n.id)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1769E8] hover:underline pt-1"
                                                >
                                                    <span>Buka Halaman Terkait</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {isUnread && (
                                        <button
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="text-xs font-semibold text-slate-400 hover:text-slate-700 shrink-0 p-1 rounded transition-colors"
                                            title="Tandai sudah dibaca"
                                        >
                                            <CheckCheck className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-12 text-center text-slate-400">
                            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <h4 className="font-bold text-slate-700 text-base">Tidak Ada Notifikasi</h4>
                            <p className="text-xs text-slate-400 mt-1">
                                Semua pemberitahuan terbaru akan muncul di sini.
                            </p>
                        </div>
                    )}
                </div>

                {notifications && <Pagination pagination={notifications} />}
            </div>
        </AppLayout>
    );
}
