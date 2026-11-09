import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Badge from '../../../Components/Badge';
import Pagination from '../../../Components/Pagination';
import {
    Search,
    Filter,
    FileText,
    Eye,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Clock,
    Paperclip,
} from 'lucide-react';

export default function ReportsIndex({ reports, employees, counts, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [employeeId, setEmployeeId] = useState(filters.employee_id || '');
    const [activeStatus, setActiveStatus] = useState(filters.status || 'ALL');

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/gm/reports',
            { search, employee_id: employeeId, status: activeStatus },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusTab = (status) => {
        setActiveStatus(status);
        router.get(
            '/gm/reports',
            { search, employee_id: employeeId, status },
            { preserveState: true, replace: true }
        );
    };

    const statusTabs = [
        { key: 'ALL', label: 'Semua Laporan' },
        { key: 'SUBMITTED', label: 'Menunggu Review' },
        { key: 'APPROVED', label: 'Disetujui' },
        { key: 'REVISION_REQUESTED', label: 'Perlu Revisi' },
        { key: 'REJECTED', label: 'Ditolak' },
    ];

    return (
        <AppLayout
            title="Laporan Pekerjaan"
            subtitle="Tinjau hasil kerja, berikan persetujuan, permintaan revisi, dan evaluasi deliverable"
        >
            <Head title="Laporan Pekerjaan - WorkTrack" />

            {/* Filter and Top Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative flex-1 w-full min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode, judul laporan, atau nama karyawan..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                        />
                    </div>

                    <select
                        value={employeeId}
                        onChange={(e) => {
                            setEmployeeId(e.target.value);
                            router.get(
                                '/gm/reports',
                                { search, employee_id: e.target.value, status: activeStatus },
                                { preserveState: true }
                            );
                        }}
                        className="w-full sm:w-auto py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white"
                    >
                        <option value="">Semua Karyawan</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.user?.name} ({emp.employee_code})
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2 bg-[#142B49] hover:bg-[#0F1F35] text-white text-sm font-semibold rounded-xl transition-colors min-h-[40px]"
                    >
                        Filter
                    </button>
                </form>

                {/* Status Tabs */}
                <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-slate-100 pb-1 scrollbar-none">
                    {statusTabs.map((tab) => {
                        const count = counts[tab.key] || 0;
                        const isCurrent = activeStatus === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleStatusTab(tab.key)}
                                className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors min-h-[36px] shrink-0 ${
                                    isCurrent
                                        ? 'bg-[#142B49] text-white'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                        isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Laporan & Tugas</th>
                                <th className="px-6 py-4">Karyawan</th>
                                <th className="px-6 py-4">Waktu Submit</th>
                                <th className="px-6 py-4">Status Review</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {reports.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        Tidak ada laporan pekerjaan ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                reports.data.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {report.report_code}
                                                </span>
                                                <Link
                                                    href={`/gm/reports/${report.id}`}
                                                    className="font-bold text-[#142B49] hover:text-[#1769E8] transition-colors block line-clamp-1"
                                                >
                                                    {report.title}
                                                </Link>
                                                <p className="text-xs text-slate-500 truncate">
                                                    Tugas: {report.task?.title}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-800">
                                                {report.employee?.user?.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {report.employee?.department?.name}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-slate-700 font-medium">
                                                {report.submitted_at?.split('T')[0]}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge status={report.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/gm/reports/${report.id}`}
                                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#1769E8] hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Periksa</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={reports.links} from={reports.from} to={reports.to} total={reports.total} />
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3">
                {reports.data.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100 text-xs">
                        Tidak ada laporan pekerjaan ditemukan.
                    </div>
                ) : (
                    reports.data.map((report) => (
                        <div
                            key={report.id}
                            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(20,43,73,0.03)] space-y-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {report.report_code}
                                        </span>
                                        <Badge status={report.status} size="xs" />
                                    </div>
                                    <Link
                                        href={`/gm/reports/${report.id}`}
                                        className="font-bold text-sm text-[#142B49] block leading-tight line-clamp-2"
                                    >
                                        {report.title}
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                                <p className="text-slate-700">
                                    Pengirim: <strong>{report.employee?.user?.name}</strong> ({report.employee?.department?.name})
                                </p>
                                <p className="text-slate-500 truncate">
                                    Tugas: {report.task?.title}
                                </p>
                                <p className="text-[11px] text-slate-400 pt-1">
                                    Dikirim: {report.submitted_at?.split('T')[0]}
                                </p>
                            </div>

                            <div className="flex items-center justify-end pt-1 border-t border-slate-100">
                                <Link
                                    href={`/gm/reports/${report.id}`}
                                    className="px-4 py-2 rounded-xl bg-[#1769E8] text-white text-xs font-bold hover:bg-blue-700 transition-colors min-h-[38px] flex items-center"
                                >
                                    Periksa Laporan
                                </Link>
                            </div>
                        </div>
                    ))
                )}
                <Pagination links={reports.links} from={reports.from} to={reports.to} total={reports.total} />
            </div>
        </AppLayout>
    );
}
