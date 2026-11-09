import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Badge from '../../../Components/Badge';
import Modal from '../../../Components/Modal';
import {
    Banknote,
    Printer,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Plus,
    Trash2,
    Calendar,
    User,
    Building2,
    CreditCard,
    DollarSign,
    ShieldCheck,
    FileText,
    Receipt,
} from 'lucide-react';

export default function PayrollShow({ payroll }) {
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);

    // Form for adding item
    const itemForm = useForm({
        type: 'ALLOWANCE',
        name: '',
        amount: '',
        note: '',
    });

    // Form for recording payment
    const payForm = useForm({
        payment_method: 'Bank Transfer (BCA)',
        payment_date: new Date().toISOString().split('T')[0],
        notes: 'Gaji telah ditransfer melalui corporate internet banking.',
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const allowances = payroll.items?.filter((item) => item.type === 'ALLOWANCE' || item.type === 'BONUS') || [];
    const deductions = payroll.items?.filter((item) => item.type === 'DEDUCTION') || [];

    const handleAddItemSubmit = (e) => {
        e.preventDefault();
        itemForm.post(`/gm/payrolls/${payroll.id}/items`, {
            onSuccess: () => {
                setIsAddItemModalOpen(false);
                itemForm.reset();
            },
        });
    };

    const handleDeleteItem = (itemId, itemName) => {
        if (confirm(`Yakin ingin menghapus item "${itemName}" dari slip ini?`)) {
            router.delete(`/gm/payrolls/items/${itemId}`);
        }
    };

    const handlePaySubmit = (e) => {
        e.preventDefault();
        payForm.post(`/gm/payrolls/${payroll.id}/pay`, {
            onSuccess: () => {
                setIsPayModalOpen(false);
            },
        });
    };

    const isPaid = payroll.payment_status === 'PAID';

    return (
        <AppLayout
            title={`Slip Gaji: ${payroll.employee?.user?.name || 'Karyawan'}`}
            subtitle={`Periode ${payroll.period?.name || '-'} • Ref: ${payroll.reference_number || 'DRAFT'}`}
        >
            <Head title={`Slip Gaji ${payroll.employee?.user?.name} - WorkTrack`} />

            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                <div className="flex items-center gap-3">
                    <Link
                        href="/gm/payrolls"
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Kembali"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">
                                {payroll.employee?.user?.name}
                            </h2>
                            <Badge status={payroll.payment_status} />
                        </div>
                        <p className="text-xs text-slate-400">
                            NIK: {payroll.employee?.employee_code || '-'} • {payroll.employee?.position?.name} ({payroll.employee?.department?.name})
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {!isPaid && (
                        <>
                            <button
                                onClick={() => setIsAddItemModalOpen(true)}
                                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Komponen</span>
                            </button>
                            <button
                                onClick={() => setIsPayModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-[0_2px_8px_rgba(16,185,129,0.25)]"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Konfirmasi Bayar</span>
                            </button>
                        </>
                    )}
                    <Link
                        href={`/gm/payrolls/${payroll.id}/print`}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-[#1769E8] bg-[#1769E8]/10 hover:bg-[#1769E8]/20 rounded-xl transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Slip Resmi</span>
                    </Link>
                </div>
            </div>

            {/* Formula Highlight Banner */}
            <div className="bg-gradient-to-r from-[#142B49] to-[#1769E8] text-white p-5 rounded-2xl shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold block">
                            Formula Penghitungan Gaji Bersih (Take Home Pay)
                        </span>
                        <div className="text-xs sm:text-sm font-mono mt-1 text-blue-100">
                            GAJI BERSIH = GAJI POKOK + TOTAL TUNJANGAN + BONUS - TOTAL POTONGAN
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <span className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold block">
                            Total Gaji Bersih Diterima
                        </span>
                        <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
                            {formatCurrency(payroll.net_salary)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Split Information Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Employee & Bank Info */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Informasi Karyawan & Rekening
                    </h3>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">Nama Lengkap</span>
                            <span className="font-semibold text-slate-800">{payroll.employee?.user?.name}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">Email</span>
                            <span className="text-slate-700 text-xs">{payroll.employee?.user?.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">Divisi / Jabatan</span>
                            <span className="text-slate-800 font-medium text-xs">
                                {payroll.employee?.department?.name} / {payroll.employee?.position?.name}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">Bank Penerima</span>
                            <span className="font-semibold text-slate-800">{payroll.employee?.bank_name || 'BCA'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">Nomor Rekening</span>
                            <span className="font-mono font-bold text-slate-900">{payroll.employee?.bank_account_number || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-slate-500 text-xs">Nomor NPWP</span>
                            <span className="font-mono text-xs text-slate-700">{payroll.employee?.npwp || '-'}</span>
                        </div>
                    </div>

                    {isPaid && (
                        <div className="mt-4 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Telah Dibayar Secara Sah</span>
                            </div>
                            <p className="text-[11px] text-emerald-700">
                                Metode: {payroll.payment_method || 'Bank Transfer'}
                            </p>
                            <p className="text-[11px] text-emerald-700 font-mono">
                                No Ref: {payroll.reference_number || '-'}
                            </p>
                            {payroll.paid_at && (
                                <p className="text-[11px] text-emerald-600">
                                    Waktu: {new Date(payroll.paid_at).toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Salary Breakdown Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Earnings: Basic + Allowances + Bonuses */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Penerimaan (Pendapatan Kotor)
                                </h3>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-600">
                                +{formatCurrency((parseFloat(payroll.basic_salary) || 0) + (parseFloat(payroll.total_allowance) || 0) + (parseFloat(payroll.total_bonus) || 0))}
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100 text-sm">
                            <div className="flex items-center justify-between py-2.5">
                                <div>
                                    <span className="font-medium text-slate-800">Gaji Pokok (Basic Salary)</span>
                                    <p className="text-[11px] text-slate-400">Standar jabatan tetap bulanan</p>
                                </div>
                                <span className="font-mono font-semibold text-slate-800">
                                    {formatCurrency(payroll.basic_salary)}
                                </span>
                            </div>

                            {allowances.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2.5 group">
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-800">{item.name}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                                                {item.type}
                                            </span>
                                        </div>
                                        {item.note && <p className="text-[11px] text-slate-400">{item.note}</p>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-medium text-emerald-600">
                                            +{formatCurrency(item.amount)}
                                        </span>
                                        {!isPaid && (
                                            <button
                                                onClick={() => handleDeleteItem(item.id, item.name)}
                                                className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                                title="Hapus komponen"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deductions: BPJS, Taxes, Others */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Potongan (Deductions)
                                </h3>
                            </div>
                            <span className="text-xs font-mono font-bold text-rose-500">
                                -{formatCurrency(payroll.total_deduction)}
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100 text-sm">
                            {deductions.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2.5 group">
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-800">{item.name}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">
                                                POTONGAN
                                            </span>
                                        </div>
                                        {item.note && <p className="text-[11px] text-slate-400">{item.note}</p>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-medium text-rose-500">
                                            -{formatCurrency(item.amount)}
                                        </span>
                                        {!isPaid && (
                                            <button
                                                onClick={() => handleDeleteItem(item.id, item.name)}
                                                className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                                title="Hapus komponen"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {deductions.length === 0 && (
                                <p className="text-xs text-slate-400 py-3 text-center">
                                    Tidak ada potongan pada slip gaji ini.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Tambah Komponen Gaji */}
            <Modal
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                title="Tambah Komponen Penggajian"
                maxWidth="md"
            >
                <form onSubmit={handleAddItemSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Jenis Komponen *
                        </label>
                        <select
                            value={itemForm.data.type}
                            onChange={(e) => itemForm.setData('type', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                        >
                            <option value="ALLOWANCE">Tunjangan (Allowance)</option>
                            <option value="BONUS">Bonus / Insentif Performa</option>
                            <option value="DEDUCTION">Potongan (Deduction)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Nama Komponen *
                        </label>
                        <input
                            type="text"
                            value={itemForm.data.name}
                            onChange={(e) => itemForm.setData('name', e.target.value)}
                            placeholder="Contoh: Tunjangan Lembur, Bonus KPI, Kasbon"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            required
                        />
                        {itemForm.errors.name && <p className="text-xs text-rose-500 mt-1">{itemForm.errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Nominal (Rp) *
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            value={itemForm.data.amount}
                            onChange={(e) => itemForm.setData('amount', e.target.value)}
                            placeholder="Contoh: 500000"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            required
                        />
                        {itemForm.errors.amount && <p className="text-xs text-rose-500 mt-1">{itemForm.errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Catatan / Keterangan
                        </label>
                        <input
                            type="text"
                            value={itemForm.data.note}
                            onChange={(e) => itemForm.setData('note', e.target.value)}
                            placeholder="Keterangan tambahan untuk slip..."
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsAddItemModalOpen(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={itemForm.processing}
                            className="px-5 py-2 text-sm font-medium text-white bg-[#1769E8] hover:bg-[#1255be] rounded-xl transition-all shadow-md disabled:opacity-60"
                        >
                            {itemForm.processing ? 'Menyimpan...' : 'Simpan Komponen'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Konfirmasi Pembayaran */}
            <Modal
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                title="Konfirmasi Pembayaran Gaji"
                maxWidth="md"
            >
                <form onSubmit={handlePaySubmit} className="space-y-4">
                    <p className="text-xs text-slate-500">
                        Anda akan menandai slip gaji ini sebagai <strong>LUNAS (PAID)</strong> sebesar{' '}
                        <strong>{formatCurrency(payroll.net_salary)}</strong> kepada {payroll.employee?.user?.name}.
                        Notifikasi resmi akan dikirimkan ke akun karyawan.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Metode Pembayaran *
                        </label>
                        <select
                            value={payForm.data.payment_method}
                            onChange={(e) => payForm.setData('payment_method', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                        >
                            <option value="Bank Transfer (BCA)">Bank Transfer (BCA)</option>
                            <option value="Bank Transfer (Mandiri)">Bank Transfer (Mandiri)</option>
                            <option value="Bank Transfer (BNI)">Bank Transfer (BNI)</option>
                            <option value="Bank Transfer (BRI)">Bank Transfer (BRI)</option>
                            <option value="Tunai / Cash">Tunai / Cash</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Tanggal Pembayaran *
                        </label>
                        <input
                            type="date"
                            value={payForm.data.payment_date}
                            onChange={(e) => payForm.setData('payment_date', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Catatan Transaksi
                        </label>
                        <textarea
                            rows={3}
                            value={payForm.data.notes}
                            onChange={(e) => payForm.setData('notes', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsPayModalOpen(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={payForm.processing}
                            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md disabled:opacity-60"
                        >
                            {payForm.processing ? 'Memproses...' : 'Tandai Sebagai Terbayar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
