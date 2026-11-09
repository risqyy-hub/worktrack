import React from 'react';

const BADGE_STYLES = {
    // Priorities
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    URGENT: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',

    // Task & Report Statuses
    UPCOMING: 'bg-purple-50 text-purple-700 border-purple-200',
    TODO: 'bg-slate-100 text-slate-700 border-slate-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
    REVISION: 'bg-orange-50 text-orange-700 border-orange-200',
    REVISION_REQUESTED: 'bg-orange-50 text-orange-700 border-orange-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SUBMITTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    OVERDUE: 'bg-red-50 text-red-700 border-red-200',
    CANCELLED: 'bg-zinc-100 text-zinc-500 border-zinc-200',

    // General & Payroll Statuses
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const LABELS = {
    LOW: 'Rendah',
    MEDIUM: 'Sedang',
    HIGH: 'Tinggi',
    URGENT: 'Mendesak',

    UPCOMING: 'Mendatang',
    TODO: 'Belum Mulai',
    IN_PROGRESS: 'Dalam Proses',
    IN_REVIEW: 'Menunggu Review',
    REVISION: 'Perlu Revisi',
    REVISION_REQUESTED: 'Perlu Revisi',
    COMPLETED: 'Selesai',
    APPROVED: 'Disetujui',
    SUBMITTED: 'Terkirim',
    REJECTED: 'Ditolak',
    OVERDUE: 'Terlambat',
    CANCELLED: 'Dibatalkan',

    active: 'Aktif',
    inactive: 'Nonaktif',
    PAID: 'Dibayar',
    PENDING: 'Menunggu',
    DRAFT: 'Draf',
    FAILED: 'Gagal',
};

export default function Badge({ status, text, size = 'sm', className = '' }) {
    const key = (status || '').toUpperCase();
    const style = BADGE_STYLES[key] || BADGE_STYLES[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    const label = text || LABELS[key] || LABELS[status] || status;

    const sizeClass = size === 'xs'
        ? 'px-2 py-0.5 text-[11px]'
        : size === 'lg'
            ? 'px-3.5 py-1 text-sm'
            : 'px-2.5 py-1 text-xs';

    return (
        <span
            className={`inline-flex items-center font-medium rounded-full border ${sizeClass} ${style} ${className}`}
        >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
            {label}
        </span>
    );
}
