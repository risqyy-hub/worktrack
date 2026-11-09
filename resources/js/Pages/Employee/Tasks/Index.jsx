import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Badge from '../../../Components/Badge';
import Pagination from '../../../Components/Pagination';
import {
    CheckSquare,
    Search,
    Filter,
    Calendar,
    ArrowRight,
    Play,
    AlertCircle,
    Paperclip,
    Clock,
    User,
    CheckCircle2,
} from 'lucide-react';

export default function EmployeeTasksIndex({
    assignments,
    counts = {},
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [activeTab, setActiveTab] = useState(filters.tab || 'IN_PROGRESS');

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/employee/tasks',
            { search, priority, tab: activeTab },
            { preserveState: true, replace: true }
        );
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        router.get(
            '/employee/tasks',
            { search, priority, tab },
            { preserveState: true, replace: true }
        );
    };

    const tabs = [
        { key: 'IN_PROGRESS', label: 'Dalam Pengerjaan', count: counts.IN_PROGRESS || 0 },
        { key: 'UPCOMING', label: 'Akan Datang', count: counts.UPCOMING || 0 },
        { key: 'COMPLETED', label: 'Selesai', count: counts.COMPLETED || 0 },
        { key: 'ALL', label: 'Semua Tugas', count: counts.ALL || 0 },
    ];

    return (
        <AppLayout
            title="Daftar Tugas Saya"
            subtitle="Kelola tugas yang didelegasikan oleh General Manager, perbarui progres, dan kirimkan deliverable"
        >
            <Head title="Tugas Saya - WorkTrack" />

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                            activeTab === tab.key
                                ? 'bg-[#7950E8] text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode tugas, judul atau rincian pekerjaan..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7950E8]"
                        />
                    </div>

                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                    >
                        <option value="">Semua Prioritas</option>
                        <option value="URGENT">Urgent (Mendesak)</option>
                        <option value="HIGH">Tinggi (High)</option>
                        <option value="MEDIUM">Sedang (Medium)</option>
                        <option value="LOW">Rendah (Low)</option>
                    </select>

                    <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2 bg-[#142B49] hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {/* Assignments List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-[#142B49]/5 text-xs uppercase font-semibold text-[#142B49] border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-4">Kode & Kategori</th>
                                <th className="px-5 py-4">Judul Tugas</th>
                                <th className="px-4 py-4 text-center">Prioritas</th>
                                <th className="px-4 py-4">Tenggat Waktu</th>
                                <th className="px-5 py-4">Progres Pengerjaan</th>
                                <th className="px-4 py-4 text-center">Status</th>
                                <th className="px-5 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {assignments?.data?.length > 0 ? (
                                assignments.data.map((a) => {
                                    const task = a.task;
                                    const isOverdue =
                                        new Date(task.due_date) < new Date() && a.status !== 'COMPLETED';

                                    return (
                                        <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className="font-mono text-xs font-bold text-slate-800 block">
                                                    {task.task_code}
                                                </span>
                                                {task.category && (
                                                    <span
                                                        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1"
                                                        style={{
                                                            backgroundColor: `${task.category.color}15`,
                                                            color: task.category.color,
                                                        }}
                                                    >
                                                        {task.category.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Link
                                                    href={`/employee/tasks/${task.id}`}
                                                    className="font-bold text-slate-800 hover:text-[#7950E8] transition-colors block text-sm"
                                                >
                                                    {task.title}
                                                </Link>
                                                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                                    {task.description}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Badge status={task.priority} />
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-xs">
                                                <div
                                                    className={`flex items-center gap-1.5 ${
                                                        isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'
                                                    }`}
                                                >
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {new Date(task.due_date).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                {isOverdue && (
                                                    <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">
                                                        Terlewat Tenggat
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1 w-36">
                                                    <div className="flex justify-between text-xs font-mono font-medium">
                                                        <span>Progres</span>
                                                        <span className="font-bold text-[#7950E8]">{a.progress_percent}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-[#7950E8] h-full rounded-full transition-all"
                                                            style={{ width: `${a.progress_percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Badge status={a.status} />
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <Link
                                                    href={`/employee/tasks/${task.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F1ECFF] text-[#7950E8] hover:bg-[#7950E8] hover:text-white rounded-xl text-xs font-bold transition-all"
                                                >
                                                    <span>Buka</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                        <CheckSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                        <p className="font-medium text-slate-600">Tidak ada tugas pada tab ini</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden divide-y divide-slate-100">
                    {assignments?.data?.length > 0 ? (
                        assignments.data.map((a) => {
                            const task = a.task;
                            const isOverdue =
                                new Date(task.due_date) < new Date() && a.status !== 'COMPLETED';

                            return (
                                <div key={a.id} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="font-mono text-[11px] font-bold text-slate-400">
                                                {task.task_code}
                                            </span>
                                            <Link
                                                href={`/employee/tasks/${task.id}`}
                                                className="font-bold text-slate-900 text-sm block mt-0.5 hover:text-[#7950E8]"
                                            >
                                                {task.title}
                                            </Link>
                                        </div>
                                        <Badge status={task.priority} />
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge status={a.status} />
                                        {task.category && (
                                            <span
                                                className="text-[10px] font-bold px-2 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: `${task.category.color}15`,
                                                    color: task.category.color,
                                                }}
                                            >
                                                {task.category.name}
                                            </span>
                                        )}
                                        <span
                                            className={`text-xs flex items-center gap-1 ${
                                                isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'
                                            }`}
                                        >
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>
                                                {new Date(task.due_date).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                })}
                                            </span>
                                        </span>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Progres Kerja</span>
                                            <span className="font-mono font-bold text-[#7950E8]">
                                                {a.progress_percent}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-[#7950E8] h-full rounded-full"
                                                style={{ width: `${a.progress_percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-1 flex justify-end">
                                        <Link
                                            href={`/employee/tasks/${task.id}`}
                                            className="inline-flex items-center gap-1 px-4 py-2 bg-[#7950E8] text-white rounded-xl text-xs font-semibold shadow-sm"
                                        >
                                            <span>Buka Lembar Kerja</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <CheckSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            <p className="font-medium text-slate-600">Tidak ada tugas ditemukan</p>
                        </div>
                    )}
                </div>

                {assignments && <Pagination pagination={assignments} />}
            </div>
        </AppLayout>
    );
}
