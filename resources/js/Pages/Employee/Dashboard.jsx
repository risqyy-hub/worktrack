import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import StatCard from '../../Components/StatCard';
import Badge from '../../Components/Badge';
import {
    CheckSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileText,
    StickyNote,
    ArrowRight,
    TrendingUp,
    Calendar,
    Plus,
    Play,
    Eye,
    ChevronRight,
} from 'lucide-react';

export default function EmployeeDashboard({
    stats = {},
    activeTasks = [],
    recentReports = [],
    notes = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <AppLayout
            title={`Halo, ${user?.name?.split(' ')[0] || 'Karyawan'}! 👋`}
            subtitle="Selamat datang di ruang kerja Anda. Pantau tugas aktif, progres pekerjaan, dan laporan hasil kerja."
        >
            <Head title="Dashboard Karyawan - WorkTrack" />

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard
                    title="Tugas Aktif"
                    value={stats.inProgress || 0}
                    subtitle="Sedang dalam proses"
                    icon={CheckSquare}
                    color="purple"
                />
                <StatCard
                    title="Menunggu Review"
                    value={stats.waitingReview || 0}
                    subtitle="Laporan sedang dievaluasi GM"
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="Tugas Selesai"
                    value={stats.completed || 0}
                    subtitle="Disetujui oleh GM"
                    icon={CheckCircle2}
                    color="green"
                />
                <StatCard
                    title="Tenggat Terlewat"
                    value={stats.overdue || 0}
                    subtitle="Perlu perhatian segera"
                    icon={AlertCircle}
                    color="rose"
                />
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Active Tasks & Recent Reports */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Tasks Section */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-[#7950E8]" />
                                    <span>Tugas Aktif Utama</span>
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Tugas dengan prioritas tinggi dan tenggat terdekat
                                </p>
                            </div>
                            <Link
                                href="/employee/tasks"
                                className="text-xs font-semibold text-[#7950E8] hover:underline inline-flex items-center gap-1"
                            >
                                <span>Semua Tugas</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {activeTasks.length > 0 ? (
                                activeTasks.map((assignment) => {
                                    const task = assignment.task;
                                    const isOverdue = new Date(task.due_date) < new Date() && assignment.status !== 'COMPLETED';

                                    return (
                                        <div
                                            key={assignment.id}
                                            className="p-4 rounded-xl border border-slate-100 hover:border-[#7950E8]/30 hover:bg-[#F1ECFF]/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                                        >
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-[11px] font-bold text-slate-400">
                                                        {task.task_code}
                                                    </span>
                                                    <Badge status={task.priority} />
                                                    <Badge status={assignment.status} />
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#7950E8] transition-colors truncate">
                                                    {task.title}
                                                </h4>
                                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span className={isOverdue ? 'text-rose-500 font-semibold' : ''}>
                                                            Tenggat: {new Date(task.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                        </span>
                                                    </span>
                                                    <span>Progres: <strong className="text-slate-700 font-mono">{assignment.progress_percent}%</strong></span>
                                                </div>
                                                {/* Progress Bar */}
                                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                                                    <div
                                                        className="bg-[#7950E8] h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${assignment.progress_percent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                <Link
                                                    href={`/employee/tasks/${task.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#7950E8] hover:bg-[#683fe0] transition-colors shadow-sm"
                                                >
                                                    <Play className="w-3 h-3 fill-white" />
                                                    <span>Kerjakan</span>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-8 text-center text-slate-400">
                                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                                    <p className="font-medium text-slate-600">Tidak ada tugas aktif saat ini</p>
                                    <p className="text-xs text-slate-400 mt-1">Semua tugas Anda telah selesai dikerjakan!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Reports & Decisions */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#7950E8]" />
                                    <span>Laporan Pekerjaan Terakhir</span>
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Status evaluasi dan umpan balik dari General Manager
                                </p>
                            </div>
                            <Link
                                href="/employee/reports"
                                className="text-xs font-semibold text-[#7950E8] hover:underline inline-flex items-center gap-1"
                            >
                                <span>Semua Laporan</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {recentReports.length > 0 ? (
                                recentReports.map((report) => (
                                    <Link
                                        key={report.id}
                                        href={`/employee/reports/${report.id}`}
                                        className="py-3 flex items-start justify-between gap-3 group hover:bg-slate-50 -mx-3 px-3 rounded-xl transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[11px] font-bold text-slate-400">
                                                    {report.report_code}
                                                </span>
                                                <Badge status={report.status} />
                                            </div>
                                            <h5 className="font-semibold text-slate-800 text-sm group-hover:text-[#7950E8] transition-colors">
                                                {report.title}
                                            </h5>
                                            <p className="text-xs text-slate-400">
                                                Tugas: {report.task?.title}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#7950E8] shrink-0 mt-2" />
                                    </Link>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 py-6 text-center">
                                    Belum ada laporan pekerjaan yang dikirimkan.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Col: Quick Notes & Summary */}
                <div className="space-y-6">
                    {/* Quick Notes Card */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                <StickyNote className="w-5 h-5 text-[#7950E8]" />
                                <span>Catatan Pribadi</span>
                            </h3>
                            <Link
                                href="/employee/notes"
                                className="text-xs font-semibold text-[#7950E8] hover:underline"
                            >
                                Kelola
                            </Link>
                        </div>

                        <div className="space-y-2.5">
                            {notes.length > 0 ? (
                                notes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                    >
                                        <h5 className="font-semibold text-slate-800 text-xs truncate">
                                            {note.title}
                                        </h5>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                            {note.content}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 py-4 text-center">
                                    Belum ada catatan. Tambahkan catatan cepat untuk menyimpan ide Anda.
                                </p>
                            )}
                        </div>

                        <Link
                            href="/employee/notes"
                            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-[#F1ECFF] text-[#7950E8] hover:bg-[#7950E8]/20 font-semibold text-xs rounded-xl transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Buat Catatan Baru</span>
                        </Link>
                    </div>

                    {/* Operational Support Banner */}
                    <div className="bg-gradient-to-br from-[#142B49] to-[#204068] text-white p-5 rounded-2xl shadow-md space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
                            <TrendingUp className="w-4 h-4 text-[#7950E8]" />
                            <span>Kinerja Operasional</span>
                        </div>
                        <h4 className="font-bold text-sm leading-snug">
                            Pastikan memperbarui progres tugas harian sebelum jam kerja berakhir.
                        </h4>
                        <p className="text-xs text-slate-300">
                            Transparansi progres membantu General Manager mengevaluasi pencapaian divisi secara akurat.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
