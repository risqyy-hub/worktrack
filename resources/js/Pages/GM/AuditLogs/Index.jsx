import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Pagination from '../../../Components/Pagination';
import Modal from '../../../Components/Modal';
import {
    ShieldCheck,
    Search,
    Filter,
    Calendar,
    Globe,
    Terminal,
    User,
    Clock,
    Activity,
    Info,
    ChevronRight,
} from 'lucide-react';

export default function AuditLogsIndex({ logs, modules = [], actions = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedModule, setSelectedModule] = useState(filters.module || '');
    const [selectedAction, setSelectedAction] = useState(filters.action || '');
    const [activeLogDetail, setActiveLogDetail] = useState(null);

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/gm/audit-logs',
            { search, module: selectedModule, action: selectedAction },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedModule('');
        setSelectedAction('');
        router.get('/gm/audit-logs', {}, { preserveState: true, replace: true });
    };

    const getModuleColor = (mod) => {
        switch (mod) {
            case 'AUTH':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'TASK':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'REPORT':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'PAYROLL':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'EMPLOYEE':
                return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <AppLayout
            title="Log Audit Aktivitas Sistem"
            subtitle="Pencatatan transparan append-only seluruh aksi penting, mutasi data, delegasi, dan transaksi finansial"
        >
            <Head title="Log Audit - WorkTrack" />

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                <form onSubmit={handleFilter} className="flex flex-col lg:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari deskripsi aktivitas, nama pengguna, IP address..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <select
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            className="w-1/2 lg:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                        >
                            <option value="">Semua Modul</option>
                            {modules.map((m) => (
                                <option key={m} value={m}>
                                    Modul: {m}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                            className="w-1/2 lg:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                        >
                            <option value="">Semua Aksi</option>
                            {actions.map((a) => (
                                <option key={a} value={a}>
                                    Aksi: {a}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <button
                            type="submit"
                            className="flex-1 lg:flex-none px-4 py-2 bg-[#1769E8] hover:bg-[#1255be] text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                            Terapkan Filter
                        </button>
                        {(search || selectedModule || selectedAction) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-colors"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-[#142B49]/5 text-xs uppercase font-semibold text-[#142B49] border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-4">Waktu</th>
                                <th className="px-5 py-4">Pelaku (User)</th>
                                <th className="px-4 py-4 text-center">Modul</th>
                                <th className="px-4 py-4 text-center">Aksi</th>
                                <th className="px-5 py-4">Aktivitas & Keterangan</th>
                                <th className="px-4 py-4">IP Address</th>
                                <th className="px-4 py-4 text-center">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs?.data?.length > 0 ? (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="text-xs font-mono font-medium text-slate-800">
                                                {new Date(log.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                            <div className="text-[11px] font-mono text-slate-400">
                                                {new Date(log.created_at).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {log.user ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-[#1769E8]/10 text-[#1769E8] font-bold text-xs flex items-center justify-center shrink-0">
                                                        {log.user.name?.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-xs">
                                                            {log.user.name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 uppercase">
                                                            {log.user.role}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Sistem Otomatis</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getModuleColor(
                                                    log.module
                                                )}`}
                                            >
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-slate-800 text-xs font-medium max-w-md">
                                                {log.description}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs text-slate-500">
                                                {log.ip_address || '127.0.0.1'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {log.metadata && Object.keys(log.metadata).length > 0 ? (
                                                <button
                                                    onClick={() => setActiveLogDetail(log)}
                                                    className="p-1.5 text-[#1769E8] hover:bg-[#1769E8]/10 rounded-lg transition-colors"
                                                    title="Lihat Metadata"
                                                >
                                                    <Info className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                        <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                        <p className="font-medium text-slate-600">Tidak ada log aktivitas ditemukan</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden divide-y divide-slate-100">
                    {logs?.data?.length > 0 ? (
                        logs.data.map((log) => (
                            <div key={log.id} className="p-4 space-y-2.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getModuleColor(
                                            log.module
                                        )}`}
                                    >
                                        {log.module} • {log.action}
                                    </span>
                                    <span className="text-slate-400 font-mono text-[11px]">
                                        {new Date(log.created_at).toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <p className="text-sm font-medium text-slate-800">{log.description}</p>

                                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                    <span className="font-medium text-slate-700">
                                        Oleh: {log.user?.name || 'Sistem'}
                                    </span>
                                    <span className="font-mono text-[11px] text-slate-400">
                                        IP: {log.ip_address || '127.0.0.1'}
                                    </span>
                                </div>

                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                    <button
                                        onClick={() => setActiveLogDetail(log)}
                                        className="text-xs text-[#1769E8] font-medium inline-flex items-center gap-1 hover:underline pt-1"
                                    >
                                        <span>Lihat parameter payload</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            <p className="font-medium text-slate-600">Tidak ada log aktivitas</p>
                        </div>
                    )}
                </div>

                {logs && <Pagination pagination={logs} />}
            </div>

            {/* Modal: Metadata Detail */}
            <Modal
                isOpen={Boolean(activeLogDetail)}
                onClose={() => setActiveLogDetail(null)}
                title="Detail Payload Log Audit"
                maxWidth="md"
            >
                {activeLogDetail && (
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                            <p>
                                <span className="font-semibold text-slate-600">Modul / Aksi:</span>{' '}
                                {activeLogDetail.module} / {activeLogDetail.action}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-600">Pelaksana:</span>{' '}
                                {activeLogDetail.user?.name || 'Sistem'}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-600">Waktu:</span>{' '}
                                {new Date(activeLogDetail.created_at).toLocaleString('id-ID')}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-600">User Agent:</span>{' '}
                                <span className="text-[11px] font-mono text-slate-500">
                                    {activeLogDetail.user_agent || '-'}
                                </span>
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Data Metadata JSON:
                            </label>
                            <pre className="bg-[#142B49] text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-60">
                                {JSON.stringify(activeLogDetail.metadata, null, 2)}
                            </pre>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setActiveLogDetail(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
