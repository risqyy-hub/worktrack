import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import StatCard from '../../Components/StatCard';
import Badge from '../../Components/Badge';
import {
    Users,
    CheckSquare,
    CheckCircle2,
    Clock,
    Calendar,
    AlertOctagon,
    FileText,
    Banknote,
    ArrowUpRight,
    ArrowRight,
    TrendingUp,
    Briefcase,
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from 'recharts';

export default function Dashboard({
    stats,
    charts,
    recentActivities = [],
    pendingReports = [],
    criticalTasks = [],
}) {
    const { auth, company } = usePage().props;
    const user = auth?.user;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const todayDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <AppLayout
            title="Dashboard Monitoring"
            subtitle="Ringkasan eksekutif operasional, delegasi tugas, dan performa karyawan"
        >
            <Head title="Dashboard General Manager - WorkTrack" />

            {/* 1. Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#142B49] via-[#1769E8] to-[#1F3C64] p-6 sm:p-8 text-white shadow-xl">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-blue-100 mb-3 border border-white/20">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{company?.name || 'WorkTrack Workspace'}</span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                        Selamat Datang Kembali, {user?.name}!
                    </h2>
                    <p className="text-sm text-blue-100 mt-2 leading-relaxed">
                        Hari ini adalah <span className="font-semibold text-white">{todayDate}</span>. Seluruh modul operasional, pelacakan tugas divisi, dan transaksi penggajian aktif terpantau secara real-time.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            href="/gm/tasks"
                            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-[#142B49] text-xs sm:text-sm font-bold shadow-md hover:bg-blue-50 transition-colors"
                        >
                            <span>Delegasikan Tugas</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/gm/reports"
                            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold border border-white/20 backdrop-blur-md transition-colors"
                        >
                            <span>Review Laporan Masuk ({stats.submittedReports})</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. Key Statistics Grid (8 Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                <StatCard
                    title="Total Karyawan"
                    value={stats.totalEmployees}
                    icon={Users}
                    iconBg="bg-blue-50 text-[#1769E8]"
                    subtitle="Karyawan aktif di sistem"
                />
                <StatCard
                    title="Total Tugas"
                    value={stats.totalTasks}
                    icon={CheckSquare}
                    iconBg="bg-indigo-50 text-indigo-600"
                    subtitle="Seluruh siklus proyek"
                />
                <StatCard
                    title="Tugas Selesai"
                    value={stats.completedTasks}
                    icon={CheckCircle2}
                    iconBg="bg-emerald-50 text-emerald-600"
                    subtitle="Telah disetujui GM"
                    trend={`${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% rasio`}
                    trendType="up"
                />
                <StatCard
                    title="Dalam Proses"
                    value={stats.inProgressTasks}
                    icon={Clock}
                    iconBg="bg-blue-50 text-blue-600"
                    subtitle="Sedang dikerjakan"
                />
                <StatCard
                    title="Tugas Mendatang"
                    value={stats.upcomingTasks}
                    icon={Calendar}
                    iconBg="bg-purple-50 text-purple-600"
                    subtitle="Jadwal mulai mendatang"
                />
                <StatCard
                    title="Tugas Terlambat"
                    value={stats.overdueTasks}
                    icon={AlertOctagon}
                    iconBg="bg-rose-50 text-rose-600"
                    subtitle="Melewati tenggat waktu"
                    trend={stats.overdueTasks > 0 ? 'Perlu atensi segera' : 'Terkendali'}
                    trendType={stats.overdueTasks > 0 ? 'down' : 'up'}
                />
                <StatCard
                    title="Laporan Masuk"
                    value={stats.submittedReports}
                    icon={FileText}
                    iconBg="bg-amber-50 text-amber-600"
                    subtitle="Menunggu persetujuan"
                />
                <StatCard
                    title="Pengeluaran Gaji"
                    value={formatCurrency(stats.totalPayrollExpense)}
                    icon={Banknote}
                    iconBg="bg-cyan-50 text-cyan-600"
                    subtitle="Total penggajian tercatat"
                />
            </div>

            {/* 3. Recharts Graphical Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Monthly Task Completion Area Chart (2 Cols) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-[#142B49] flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-[#1769E8]" />
                                Tren Pembuatan & Penyelesaian Tugas
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Perbandingan volume tugas yang didelegasikan dan dirampungkan (6 bulan terakhir)
                            </p>
                        </div>
                    </div>

                    <div className="h-64 sm:h-72 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.monthlyCompletion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1769E8" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#1769E8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#142B49',
                                        borderRadius: '12px',
                                        border: 'none',
                                        color: '#FFFFFF',
                                        fontSize: '12px',
                                    }}
                                />
                                <Area type="monotone" dataKey="Dibuat" stroke="#1769E8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCreated)" />
                                <Area type="monotone" dataKey="Selesai" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompleted)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution Pie Chart (1 Col) */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] flex flex-col justify-between">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-[#142B49]">
                            Distribusi Status Tugas
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Status aktif seluruh penugasan
                        </p>
                    </div>

                    <div className="h-56 w-full my-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {charts.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#142B49',
                                        borderRadius: '12px',
                                        color: '#FFFFFF',
                                        fontSize: '12px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        {charts.statusDistribution.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-slate-600 truncate">{item.name}</span>
                                <span className="font-bold text-slate-800 ml-auto">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. Action Sections: Critical Tasks & Pending Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Critical / Overdue Tasks */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-base font-bold text-[#142B49] flex items-center">
                                <AlertOctagon className="w-4 h-4 mr-2 text-rose-500" />
                                Tugas Mendesak & Perlu Perhatian
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Tugas prioritas tinggi atau mendekati/melewati batas waktu</p>
                        </div>
                        <Link href="/gm/tasks" className="text-xs text-[#1769E8] font-bold hover:underline shrink-0">
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {criticalTasks.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400">
                                Tidak ada tugas berstatus kritis atau terlambat saat ini.
                            </div>
                        ) : (
                            criticalTasks.map((task) => (
                                <Link
                                    key={task.id}
                                    href={`/gm/tasks/${task.id}`}
                                    className="block p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {task.task_code}
                                                </span>
                                                <Badge status={task.priority} size="xs" />
                                                <Badge status={task.effective_status} size="xs" />
                                            </div>
                                            <h4 className="text-sm font-bold text-[#142B49] mt-1 truncate">
                                                {task.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                                <span>Deadline: {task.due_date}</span>
                                                <span>•</span>
                                                <span>Ditugaskan: {task.assignments?.map((a) => a.employee?.user?.name).join(', ') || '-'}</span>
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-bold text-slate-700">{task.progress_percent}%</span>
                                            <div className="w-14 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-[#1769E8] rounded-full" style={{ width: `${task.progress_percent}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Pending Reports Needing GM Review */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-base font-bold text-[#142B49] flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-amber-500" />
                                Laporan Masuk Menunggu Review
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Laporan pekerjaan yang perlu diperiksa dan disetujui</p>
                        </div>
                        <Link href="/gm/reports" className="text-xs text-[#1769E8] font-bold hover:underline shrink-0">
                            Semua Laporan
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {pendingReports.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400">
                                Tidak ada laporan pekerjaan yang sedang menunggu review.
                            </div>
                        ) : (
                            pendingReports.map((report) => (
                                <Link
                                    key={report.id}
                                    href={`/gm/reports/${report.id}`}
                                    className="block p-3.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {report.report_code}
                                                </span>
                                                <Badge status={report.status} size="xs" />
                                            </div>
                                            <h4 className="text-sm font-bold text-[#142B49] mt-1 truncate">
                                                {report.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                Oleh: <span className="font-semibold text-slate-700">{report.employee?.user?.name}</span> • Tugas: {report.task?.title}
                                            </p>
                                        </div>
                                        <div className="shrink-0 pt-1">
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-[#1769E8] text-white text-[11px] font-semibold hover:bg-blue-700">
                                                Periksa
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 5. Recent Activity Logs */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-[#142B49]">
                            Aktivitas & Audit Sistem Terkini
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Catatan audit aktivitas karyawan dan manajemen
                        </p>
                    </div>
                    <Link href="/gm/audit-logs" className="text-xs text-[#1769E8] font-bold hover:underline">
                        Lihat Riwayat Audit
                    </Link>
                </div>

                <div className="divide-y divide-slate-100">
                    {recentActivities.map((act) => (
                        <div key={act.id} className="py-3 flex items-start space-x-3 text-xs">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {act.user?.name?.charAt(0) || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-800 font-medium leading-relaxed">
                                    <span className="font-bold text-[#142B49]">{act.user?.name || 'Sistem'}</span>: {act.description}
                                </p>
                                <span className="text-[11px] text-slate-400 mt-0.5 block">
                                    {act.created_at}
                                </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold shrink-0">
                                {act.module}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
