import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import StatCard from '../../../Components/StatCard';
import Badge from '../../../Components/Badge';
import Pagination from '../../../Components/Pagination';
import Modal from '../../../Components/Modal';
import {
    Banknote,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Printer,
    Calendar,
    ChevronDown,
    CreditCard,
    DollarSign,
    UserCheck,
} from 'lucide-react';

export default function PayrollsIndex({
    payrolls,
    periods = [],
    selectedPeriod,
    summary = {},
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [periodId, setPeriodId] = useState(filters.period_id || selectedPeriod?.id || '');
    const [isCreatePeriodModalOpen, setIsCreatePeriodModalOpen] = useState(false);

    // Form for new period
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        start_date: '',
        end_date: '',
        payment_date: '',
        notes: '',
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/gm/payrolls',
            { period_id: periodId, status, search },
            { preserveState: true, replace: true }
        );
    };

    const handlePeriodChange = (newPeriodId) => {
        setPeriodId(newPeriodId);
        router.get(
            '/gm/payrolls',
            { period_id: newPeriodId, status, search },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusFilter = (newStatus) => {
        setStatus(newStatus);
        router.get(
            '/gm/payrolls',
            { period_id: periodId, status: newStatus, search },
            { preserveState: true, replace: true }
        );
    };

    const handleCreatePeriodSubmit = (e) => {
        e.preventDefault();
        post('/gm/payrolls/period', {
            onSuccess: () => {
                setIsCreatePeriodModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout
            title="Penggajian & Slip Gaji"
            subtitle="Kelola periode payroll bulanan, verifikasi tunjangan/potongan, dan eksekusi pembayaran gaji"
        >
            <Head title="Penggajian - WorkTrack" />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="Total Beban Payroll"
                    value={formatCurrency(summary.totalExpense)}
                    subtitle={selectedPeriod ? selectedPeriod.name : 'Semua data'}
                    icon={Banknote}
                    color="blue"
                />
                <StatCard
                    title="Sudah Dibayarkan"
                    value={formatCurrency(summary.totalPaid)}
                    subtitle={`${summary.countPaid || 0} karyawan terselesaikan`}
                    icon={CheckCircle2}
                    color="green"
                />
                <StatCard
                    title="Menunggu Pembayaran"
                    value={formatCurrency(summary.totalPending)}
                    subtitle={`${summary.countPending || 0} slip siap ditransfer`}
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="Total Karyawan"
                    value={payrolls?.total || 0}
                    subtitle="Terdaftar pada slip periode ini"
                    icon={UserCheck}
                    color="purple"
                />
            </div>

            {/* Actions & Filters */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Period Picker */}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-500 uppercase">Periode:</span>
                        <select
                            value={periodId}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#1769E8] focus:bg-white"
                        >
                            {periods.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.status})
                                </option>
                            ))}
                            {periods.length === 0 && <option value="">Belum ada periode</option>}
                        </select>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {selectedPeriod && (
                            <a
                                href={`/gm/export/payrolls?period_id=${selectedPeriod.id}`}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span>Ekspor CSV</span>
                            </a>
                        )}
                        <button
                            onClick={() => setIsCreatePeriodModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769E8] hover:bg-[#1255be] text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-[0_2px_8px_rgba(23,105,232,0.25)]"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Periode Baru</span>
                        </button>
                    </div>
                </div>

                {/* Search & Status Filters */}
                <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama karyawan, no referensi slip..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                    >
                        <option value="">Semua Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING">Menunggu</option>
                        <option value="PAID">Sudah Dibayar (Lunas)</option>
                        <option value="CANCELLED">Dibatalkan</option>
                    </select>

                    <button
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {/* Payroll Data Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-[#142B49]/5 text-xs uppercase font-semibold text-[#142B49] border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-4">Karyawan</th>
                                <th className="px-4 py-4">Jabatan & Divisi</th>
                                <th className="px-4 py-4 text-right">Gaji Pokok</th>
                                <th className="px-4 py-4 text-right">Tunjangan</th>
                                <th className="px-4 py-4 text-right">Potongan</th>
                                <th className="px-4 py-4 text-right">Gaji Bersih (Net)</th>
                                <th className="px-4 py-4 text-center">Status</th>
                                <th className="px-5 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payrolls?.data?.length > 0 ? (
                                payrolls.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#1769E8]/10 text-[#1769E8] font-bold text-xs flex items-center justify-center shrink-0">
                                                    {p.employee?.user?.name?.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">
                                                        {p.employee?.user?.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        NIK: {p.employee?.employee_code || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-slate-800 font-medium text-xs">
                                                {p.employee?.position?.name || '-'}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                {p.employee?.department?.name || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-right font-mono text-xs text-slate-700">
                                            {formatCurrency(p.basic_salary)}
                                        </td>
                                        <td className="px-4 py-4 text-right font-mono text-xs text-emerald-600">
                                            +{formatCurrency(p.total_allowance + p.total_bonus)}
                                        </td>
                                        <td className="px-4 py-4 text-right font-mono text-xs text-rose-500">
                                            -{formatCurrency(p.total_deduction)}
                                        </td>
                                        <td className="px-4 py-4 text-right font-mono text-sm font-bold text-slate-900">
                                            {formatCurrency(p.net_salary)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Badge status={p.payment_status} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/gm/payrolls/${p.id}`}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#1769E8] hover:bg-[#1769E8]/10 transition-colors"
                                                    title="Lihat Detail Slip"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/gm/payrolls/${p.id}/print`}
                                                    target="_blank"
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                    title="Cetak Slip Resmi"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                                        <Banknote className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                        <p className="font-medium text-slate-600">Tidak ada data slip gaji</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Silakan buat periode baru atau ubah filter pencarian.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="lg:hidden divide-y divide-slate-100">
                    {payrolls?.data?.length > 0 ? (
                        payrolls.data.map((p) => (
                            <div key={p.id} className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-[#1769E8]/10 text-[#1769E8] font-bold text-xs flex items-center justify-center shrink-0">
                                            {p.employee?.user?.name?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 text-sm">
                                                {p.employee?.user?.name}
                                            </h4>
                                            <p className="text-xs text-slate-400">
                                                {p.employee?.position?.name} • {p.employee?.department?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge status={p.payment_status} />
                                </div>

                                <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Gaji Pokok</span>
                                        <span className="font-mono font-medium text-slate-700">
                                            {formatCurrency(p.basic_salary)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Tunjangan / Bonus</span>
                                        <span className="font-mono font-medium text-emerald-600">
                                            +{formatCurrency(p.total_allowance + p.total_bonus)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Potongan (BPJS/Pajak)</span>
                                        <span className="font-mono font-medium text-rose-500">
                                            -{formatCurrency(p.total_deduction)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px] font-semibold text-[#142B49]">
                                            Gaji Bersih
                                        </span>
                                        <span className="font-mono font-bold text-sm text-[#1769E8]">
                                            {formatCurrency(p.net_salary)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <Link
                                        href={`/gm/payrolls/${p.id}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#1769E8] bg-[#1769E8]/10 hover:bg-[#1769E8]/20 transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Rincian Slip</span>
                                    </Link>
                                    <Link
                                        href={`/gm/payrolls/${p.id}/print`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Cetak</span>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <Banknote className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            <p className="font-medium text-slate-600">Tidak ada slip gaji ditemukan</p>
                        </div>
                    )}
                </div>

                {payrolls && <Pagination pagination={payrolls} />}
            </div>

            {/* Create Period Modal */}
            <Modal
                isOpen={isCreatePeriodModalOpen}
                onClose={() => setIsCreatePeriodModalOpen(false)}
                title="Buka Periode Penggajian Baru"
                maxWidth="md"
            >
                <form onSubmit={handleCreatePeriodSubmit} className="space-y-4">
                    <p className="text-xs text-slate-500">
                        Membuat periode baru akan secara otomatis meng-generate draft slip gaji untuk seluruh karyawan aktif berdasarkan gaji pokok dan tunjangan standar.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Nama Periode *
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Gaji Periode November 2026"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            required
                        />
                        {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Tanggal Mulai *
                            </label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                required
                            />
                            {errors.start_date && <p className="text-xs text-rose-500 mt-1">{errors.start_date}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Tanggal Akhir *
                            </label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                required
                            />
                            {errors.end_date && <p className="text-xs text-rose-500 mt-1">{errors.end_date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Estimasi Tanggal Pembayaran *
                        </label>
                        <input
                            type="date"
                            value={data.payment_date}
                            onChange={(e) => setData('payment_date', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            required
                        />
                        {errors.payment_date && <p className="text-xs text-rose-500 mt-1">{errors.payment_date}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Catatan Periode
                        </label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Catatan internal GM mengenai periode ini..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsCreatePeriodModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 text-sm font-medium text-white bg-[#1769E8] hover:bg-[#1255be] rounded-xl transition-all shadow-md disabled:opacity-60"
                        >
                            {processing ? 'Memproses...' : 'Generate Slip Gaji'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
