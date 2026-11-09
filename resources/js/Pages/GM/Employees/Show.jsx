import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import StatCard from '../../../Components/StatCard';
import Badge from '../../../Components/Badge';
import {
    ArrowLeft,
    CheckSquare,
    CheckCircle2,
    Clock,
    AlertOctagon,
    TrendingUp,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Building2,
    CreditCard,
    FileText,
} from 'lucide-react';

export default function EmployeeShow({ employee, stats }) {
    const [activeTab, setActiveTab] = useState('tasks');

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <AppLayout
            title={`Detail Karyawan - ${employee.user.name}`}
            subtitle={`Kode Kepegawaian: ${employee.employee_code}`}
        >
            <Head title={`Profil Karyawan: ${employee.user.name} - WorkTrack`} />

            {/* Back Button & Top Navigation */}
            <div>
                <Link
                    href="/gm/employees"
                    className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-[#1769E8] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Karyawan</span>
                </Link>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 text-[#1769E8] font-bold text-2xl flex items-center justify-center shrink-0">
                            {employee.user.avatar ? (
                                <img
                                    src={`/storage/${employee.user.avatar}`}
                                    alt={employee.user.name}
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            ) : (
                                employee.user.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h2 className="text-xl sm:text-2xl font-bold text-[#142B49]">
                                    {employee.user.name}
                                </h2>
                                <Badge status={employee.status} />
                            </div>
                            <p className="text-sm font-semibold text-slate-600 mt-1">
                                {employee.position?.name || '-'} • <span className="text-slate-500">{employee.department?.name || '-'}</span>
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                                ID: {employee.employee_code} • Bergabung sejak {employee.join_date ? new Date(employee.join_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                            Gaji Pokok: {formatCurrency(employee.basic_salary)}
                        </span>
                    </div>
                </div>

                {/* Contact and Bio Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs text-slate-600">
                    <div className="flex items-center space-x-2.5">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{employee.user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{employee.phone || '-'}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{employee.address || 'Alamat belum diatur'}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                        <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">
                            {employee.bank_name ? `${employee.bank_name} (${employee.bank_account_number})` : 'Rekening belum diset'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <StatCard
                    title="Total Tugas"
                    value={stats.totalAssigned}
                    icon={CheckSquare}
                    iconBg="bg-blue-50 text-[#1769E8]"
                />
                <StatCard
                    title="Tugas Selesai"
                    value={stats.completedCount}
                    icon={CheckCircle2}
                    iconBg="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    title="Dalam Proses"
                    value={stats.inProgressCount}
                    icon={Clock}
                    iconBg="bg-indigo-50 text-indigo-600"
                />
                <StatCard
                    title="Tugas Terlambat"
                    value={stats.overdueCount}
                    icon={AlertOctagon}
                    iconBg="bg-rose-50 text-rose-600"
                />
                <StatCard
                    title="Tingkat Selesai"
                    value={`${stats.productivityRate}%`}
                    icon={TrendingUp}
                    iconBg="bg-purple-50 text-purple-600"
                />
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-200">
                <div className="flex space-x-4 overflow-x-auto pb-1">
                    {[
                        { id: 'tasks', label: `Daftar Penugasan (${employee.assignments.length})` },
                        { id: 'reports', label: `Riwayat Laporan (${employee.task_reports.length})` },
                        { id: 'payrolls', label: `Riwayat Gaji (${employee.payrolls.length})` },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-3 px-1 text-sm font-bold border-b-2 whitespace-nowrap transition-colors min-h-[44px] ${
                                activeTab === tab.id
                                    ? 'border-[#1769E8] text-[#1769E8]'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab 1: Tasks */}
            {activeTab === 'tasks' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {employee.assignments.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400">
                                Belum ada tugas yang didelegasikan ke karyawan ini.
                            </div>
                        ) : (
                            employee.assignments.map((assign) => (
                                <div key={assign.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                {assign.task?.task_code}
                                            </span>
                                            <Badge status={assign.task?.priority} size="xs" />
                                            <Badge status={assign.status} size="xs" />
                                        </div>
                                        <h4 className="font-bold text-sm text-[#142B49]">
                                            {assign.task?.title}
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Deadline: {assign.task?.due_date} • Ditugaskan: {assign.assigned_at?.split('T')[0]}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4 shrink-0">
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-slate-700">{assign.progress_percent}%</span>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1">
                                                <div className="h-full bg-[#1769E8] rounded-full" style={{ width: `${assign.progress_percent}%` }} />
                                            </div>
                                        </div>
                                        <Link
                                            href={`/gm/tasks/${assign.task_id}`}
                                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                                        >
                                            Detail Tugas
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Tab 2: Reports */}
            {activeTab === 'reports' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {employee.task_reports.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400">
                                Belum ada laporan pekerjaan yang dikirimkan.
                            </div>
                        ) : (
                            employee.task_reports.map((rep) => (
                                <div key={rep.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
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
                                            Tugas: {rep.task?.title} • Dikirim: {rep.submitted_at?.split('T')[0]}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/gm/reports/${rep.id}`}
                                        className="px-3 py-1.5 rounded-lg bg-[#1769E8] hover:bg-blue-700 text-white text-xs font-semibold transition-colors shrink-0"
                                    >
                                        Periksa Laporan
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Tab 3: Payrolls */}
            {activeTab === 'payrolls' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {employee.payrolls.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400">
                                Belum ada riwayat penggajian untuk karyawan ini.
                            </div>
                        ) : (
                            employee.payrolls.map((pay) => (
                                <div key={pay.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50">
                                    <div>
                                        <p className="font-bold text-sm text-[#142B49]">
                                            {pay.period?.name || 'Periode Gaji'}
                                        </p>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                                            Ref: {pay.reference_number || 'Belum dibayar'}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-slate-800">
                                                {formatCurrency(pay.net_salary)}
                                            </p>
                                            <Badge status={pay.payment_status} size="xs" />
                                        </div>
                                        <Link
                                            href={`/gm/payrolls/${pay.id}`}
                                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
                                        >
                                            Slip
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
