import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Badge from '../../../Components/Badge';
import {
    ArrowLeft,
    Calendar,
    Users,
    Paperclip,
    Clock,
    CheckCircle2,
    AlertOctagon,
    FileText,
    FileCheck,
    Download,
    Check,
    XCircle,
} from 'lucide-react';

export default function TaskShow({ task }) {
    const handleStatusChange = (newStatus) => {
        if (confirm(`Ubah status tugas menjadi ${newStatus}?`)) {
            router.patch(`/gm/tasks/${task.id}/status`, { status: newStatus });
        }
    };

    return (
        <AppLayout
            title={`Detail Tugas: ${task.task_code}`}
            subtitle={task.title}
        >
            <Head title={`Tugas ${task.task_code} - WorkTrack`} />

            {/* Back button */}
            <div>
                <Link
                    href="/gm/tasks"
                    className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-[#1769E8] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Tugas</span>
                </Link>
            </div>

            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {task.task_code}
                            </span>
                            {task.category && (
                                <span
                                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: `${task.category.color}15`,
                                        color: task.category.color,
                                    }}
                                >
                                    {task.category.name}
                                </span>
                            )}
                            <Badge status={task.priority} size="sm" />
                            <Badge status={task.effective_status} size="sm" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#142B49] leading-snug">
                            {task.title}
                        </h2>
                    </div>

                    {/* Quick GM Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {task.status !== 'COMPLETED' && (
                            <button
                                type="button"
                                onClick={() => handleStatusChange('COMPLETED')}
                                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors min-h-[40px]"
                            >
                                <Check className="w-4 h-4" />
                                <span>Tandai Selesai</span>
                            </button>
                        )}
                        {task.status !== 'CANCELLED' && (
                            <button
                                type="button"
                                onClick={() => handleStatusChange('CANCELLED')}
                                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors min-h-[40px]"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Batalkan Tugas</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                        <span>Akumulasi Progres Pengerjaan</span>
                        <span className="text-sm font-extrabold text-[#1769E8]">{task.progress_percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-[#1769E8]'
                            }`}
                            style={{ width: `${task.progress_percent}%` }}
                        />
                    </div>
                </div>

                {/* Scope & Description */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Deskripsi Lingkup Pekerjaan
                        </h4>
                        <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100 whitespace-pre-line">
                            {task.description || 'Tidak ada rincian deskripsi tambahan.'}
                        </div>
                    </div>

                    {task.additional_instructions && (
                        <div>
                            <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">
                                Instruksi Khusus / SOP Pengerjaan
                            </h4>
                            <div className="text-sm text-amber-900 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 whitespace-pre-line">
                                {task.additional_instructions}
                            </div>
                        </div>
                    )}
                </div>

                {/* Dates & Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
                    <div>
                        <span className="text-slate-400 block">Tanggal Mulai:</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{task.start_date}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block">Tenggat Waktu:</span>
                        <span className={`font-bold mt-0.5 block ${task.is_overdue ? 'text-rose-600' : 'text-slate-800'}`}>
                            {task.due_date} {task.is_overdue && '(Terlambat)'}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 block">Diberikan Oleh:</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{task.creator?.name || 'General Manager'}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block">Status Terakhir:</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{task.status}</span>
                    </div>
                </div>

                {/* Attachments */}
                {task.attachments && task.attachments.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                            <Paperclip className="w-3.5 h-3.5 mr-1.5" />
                            Lampiran Dokumen ({task.attachments.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {task.attachments.map((file) => (
                                <a
                                    key={file.id}
                                    href={`/storage/${file.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs transition-colors"
                                >
                                    <div className="flex items-center space-x-2 truncate pr-2">
                                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                        <span className="font-semibold text-slate-800 truncate">{file.file_name}</span>
                                    </div>
                                    <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Assignees & Progress Updates Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Assignees List */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                    <h3 className="text-base font-bold text-[#142B49] flex items-center mb-4 pb-3 border-b border-slate-100">
                        <Users className="w-4 h-4 mr-2 text-[#1769E8]" />
                        Penerima Tugas ({task.assignments?.length || 0})
                    </h3>

                    <div className="space-y-3">
                        {task.assignments?.map((assign) => (
                            <div
                                key={assign.id}
                                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1769E8] font-bold flex items-center justify-center text-xs shrink-0">
                                        {assign.employee?.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#142B49]">
                                            {assign.employee?.user?.name}
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            {assign.employee?.position?.name} • {assign.employee?.department?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge status={assign.status} size="xs" />
                                    <p className="text-xs font-bold text-slate-700 mt-1">{assign.progress_percent}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Log Timeline */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                    <h3 className="text-base font-bold text-[#142B49] flex items-center mb-4 pb-3 border-b border-slate-100">
                        <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                        Riwayat Pembaruan Progres
                    </h3>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {task.progresses?.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-6">
                                Belum ada catatan progres yang disubmit oleh karyawan.
                            </p>
                        ) : (
                            task.progresses?.map((prog) => (
                                <div key={prog.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 text-xs space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800">
                                            {prog.employee?.user?.name}
                                        </span>
                                        <span className="font-extrabold text-[#1769E8] bg-blue-50 px-2 py-0.5 rounded">
                                            {prog.progress_percent}%
                                        </span>
                                    </div>
                                    <p className="text-slate-600">{prog.note}</p>
                                    <span className="text-[10px] text-slate-400 block pt-0.5">
                                        {prog.created_at}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-[#142B49] flex items-center">
                            <FileCheck className="w-4 h-4 mr-2 text-emerald-500" />
                            Laporan Pekerjaan Terkait ({task.reports?.length || 0})
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Laporan hasil penyelesaian tugas yang diserahkan karyawan</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {task.reports?.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8">
                            Belum ada laporan pekerjaan yang diajukan untuk tugas ini.
                        </p>
                    ) : (
                        task.reports?.map((rep) => (
                            <div
                                key={rep.id}
                                className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {rep.report_code}
                                        </span>
                                        <Badge status={rep.status} size="xs" />
                                    </div>
                                    <h4 className="font-bold text-sm text-[#142B49]">
                                        {rep.title}
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        Oleh: <strong>{rep.employee?.user?.name}</strong> • Dikirim: {rep.submitted_at?.split('T')[0]}
                                    </p>
                                </div>
                                <Link
                                    href={`/gm/reports/${rep.id}`}
                                    className="px-4 py-2 rounded-xl bg-[#1769E8] hover:bg-blue-700 text-white text-xs font-bold transition-colors shrink-0 text-center"
                                >
                                    Periksa & Berikan Review
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
