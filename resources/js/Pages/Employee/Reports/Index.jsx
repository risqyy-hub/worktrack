import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Badge from '../../../Components/Badge';
import Pagination from '../../../Components/Pagination';
import Modal from '../../../Components/Modal';
import {
    FileText,
    Search,
    Filter,
    Plus,
    Calendar,
    Paperclip,
    ArrowRight,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
} from 'lucide-react';

export default function EmployeeReportsIndex({
    reports,
    eligibleAssignments = [],
    counts = {},
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeStatus, setActiveStatus] = useState(filters.status || 'ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        task_assignment_id: eligibleAssignments[0]?.id || '',
        title: '',
        work_description: '',
        result_summary: '',
        obstacles: '',
        progress_percent: 100,
        attachments: [],
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/employee/reports',
            { search, status: activeStatus },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusTab = (status) => {
        setActiveStatus(status);
        router.get(
            '/employee/reports',
            { search, status },
            { preserveState: true, replace: true }
        );
    };

    const handleCreateReport = (e) => {
        e.preventDefault();
        post('/employee/reports', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const statusTabs = [
        { key: 'ALL', label: 'Semua Laporan', count: counts.ALL || 0 },
        { key: 'SUBMITTED', label: 'Menunggu Review', count: counts.SUBMITTED || 0 },
        { key: 'APPROVED', label: 'Disetujui', count: counts.APPROVED || 0 },
        { key: 'REVISION_REQUESTED', label: 'Perlu Revisi', count: counts.REVISION_REQUESTED || 0 },
        { key: 'REJECTED', label: 'Ditolak', count: counts.REJECTED || 0 },
    ];

    return (
        <AppLayout
            title="Laporan Hasil Kerja Saya"
            subtitle="Dokumentasikan capaian penugasan, lampirkan bukti deliverable, dan pantau hasil evaluasi General Manager"
        >
            <Head title="Laporan Pekerjaan - WorkTrack" />

            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleStatusTab(tab.key)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                            activeStatus === tab.key
                                ? 'bg-[#7950E8] text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                activeStatus === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] flex flex-col sm:flex-row items-center justify-between gap-3">
                <form onSubmit={handleFilter} className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kode laporan, judul tugas, deskripsi hasil..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7950E8]"
                    />
                </form>

                {eligibleAssignments.length > 0 && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#7950E8] hover:bg-[#683fe0] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Kirim Laporan Baru</span>
                    </button>
                )}
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-[#142B49]/5 text-xs uppercase font-semibold text-[#142B49] border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-4">Kode Laporan</th>
                                <th className="px-5 py-4">Tugas Terkait</th>
                                <th className="px-5 py-4">Judul Laporan</th>
                                <th className="px-4 py-4 text-center">Waktu Kirim</th>
                                <th className="px-4 py-4 text-center">Status Review</th>
                                <th className="px-5 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports?.data?.length > 0 ? (
                                reports.data.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs font-bold text-slate-800">
                                                {r.report_code}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-800 text-xs">
                                                {r.task?.title}
                                            </p>
                                            <span className="text-[10px] font-mono text-slate-400">
                                                {r.task?.task_code}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <Link
                                                href={`/employee/reports/${r.id}`}
                                                className="font-bold text-slate-800 hover:text-[#7950E8] transition-colors block text-sm"
                                            >
                                                {r.title}
                                            </Link>
                                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                                {r.work_description}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-center whitespace-nowrap text-xs text-slate-500">
                                            {new Date(r.submitted_at || r.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Badge status={r.status} />
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <Link
                                                href={`/employee/reports/${r.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1ECFF] text-[#7950E8] hover:bg-[#7950E8] hover:text-white rounded-xl text-xs font-semibold transition-all"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Detail</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                        <p className="font-medium text-slate-600">Tidak ada laporan pada filter ini</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden divide-y divide-slate-100">
                    {reports?.data?.length > 0 ? (
                        reports.data.map((r) => (
                            <div key={r.id} className="p-4 space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="font-mono text-[11px] font-bold text-slate-400">
                                            {r.report_code}
                                        </span>
                                        <Link
                                            href={`/employee/reports/${r.id}`}
                                            className="font-bold text-slate-900 text-sm block mt-0.5 hover:text-[#7950E8]"
                                        >
                                            {r.title}
                                        </Link>
                                    </div>
                                    <Badge status={r.status} />
                                </div>

                                <p className="text-xs text-slate-500 line-clamp-2">{r.work_description}</p>

                                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                                    <span>Tugas: {r.task?.title}</span>
                                    <span>{new Date(r.submitted_at || r.created_at).toLocaleDateString('id-ID')}</span>
                                </div>

                                <div className="pt-1 flex justify-end">
                                    <Link
                                        href={`/employee/reports/${r.id}`}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F1ECFF] text-[#7950E8] rounded-xl text-xs font-bold"
                                    >
                                        <span>Lihat Keputusan & Revisi</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            <p className="font-medium text-slate-600">Tidak ada laporan ditemukan</p>
                        </div>
                    )}
                </div>

                {reports && <Pagination pagination={reports} />}
            </div>

            {/* Modal: Buat Laporan Baru */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Kirim Laporan Hasil Pekerjaan ke GM"
                maxWidth="lg"
            >
                <form onSubmit={handleCreateReport} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Pilih Tugas Terkait *
                        </label>
                        <select
                            value={data.task_assignment_id}
                            onChange={(e) => setData('task_assignment_id', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            required
                        >
                            {eligibleAssignments.map((a) => (
                                <option key={a.id} value={a.id}>
                                    [{a.task?.task_code}] {a.task?.title}
                                </option>
                            ))}
                        </select>
                        {errors.task_assignment_id && (
                            <p className="text-xs text-rose-500 mt-1">{errors.task_assignment_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Judul Laporan *
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Laporan Penyelesaian Desain Arsitektur"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            required
                        />
                        {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Deskripsi Rinci Pekerjaan *
                        </label>
                        <textarea
                            rows={4}
                            value={data.work_description}
                            onChange={(e) => setData('work_description', e.target.value)}
                            placeholder="Jelaskan secara lengkap langkah, deliverable, dan tautan hasil..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            required
                        />
                        {errors.work_description && (
                            <p className="text-xs text-rose-500 mt-1">{errors.work_description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Ringkasan Capaian (Summary)
                            </label>
                            <textarea
                                rows={2}
                                value={data.result_summary}
                                onChange={(e) => setData('result_summary', e.target.value)}
                                placeholder="Inti deliverable..."
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Kendala / Catatan Tambahan
                            </label>
                            <textarea
                                rows={2}
                                value={data.obstacles}
                                onChange={(e) => setData('obstacles', e.target.value)}
                                placeholder="Jika ada hambatan..."
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Lampiran Bukti Kerja (File PDF, ZIP, Gambar max 10MB)
                        </label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setData('attachments', Array.from(e.target.files))}
                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#F1ECFF] file:text-[#7950E8] hover:file:bg-[#7950E8]/20"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 text-sm font-semibold text-white bg-[#7950E8] hover:bg-[#683fe0] rounded-xl transition-all shadow-md disabled:opacity-60"
                        >
                            {processing ? 'Mengirim...' : 'Kirim Laporan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
