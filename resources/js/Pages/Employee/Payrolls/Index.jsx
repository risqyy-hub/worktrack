import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Badge from '../../../Components/Badge';
import Pagination from '../../../Components/Pagination';
import {
    Banknote,
    Printer,
    Eye,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    CreditCard,
} from 'lucide-react';

export default function EmployeePayrollsIndex({ payrolls }) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <AppLayout
            title="Riwayat Slip Gaji Saya"
            subtitle="Informasi transparansi penggajian bulanan, rincian tunjangan, potongan pajak/BPJS, dan slip gaji resmi"
        >
            <Head title="Slip Gaji - WorkTrack" />

            {/* List Table / Cards */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-[#142B49]/5 text-xs uppercase font-semibold text-[#142B49] border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-4">Periode Penggajian</th>
                                <th className="px-5 py-4">Nomor Referensi</th>
                                <th className="px-5 py-4 text-right">Gaji Pokok</th>
                                <th className="px-5 py-4 text-right">Tunjangan & Bonus</th>
                                <th className="px-5 py-4 text-right">Potongan</th>
                                <th className="px-5 py-4 text-right">Gaji Bersih (Net)</th>
                                <th className="px-4 py-4 text-center">Status</th>
                                <th className="px-5 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payrolls?.data?.length > 0 ? (
                                payrolls.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="font-bold text-slate-900 text-sm">
                                                {p.period?.name || 'Periode Penggajian'}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {p.paid_at
                                                    ? `Dibayar: ${new Date(p.paid_at).toLocaleDateString('id-ID')}`
                                                    : 'Belum dibayarkan'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs font-semibold text-slate-700">
                                                {p.reference_number || 'DRAFT'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right font-mono text-xs text-slate-700">
                                            {formatCurrency(p.basic_salary)}
                                        </td>
                                        <td className="px-5 py-4 text-right font-mono text-xs text-emerald-600">
                                            +{formatCurrency(parseFloat(p.total_allowance || 0) + parseFloat(p.total_bonus || 0))}
                                        </td>
                                        <td className="px-5 py-4 text-right font-mono text-xs text-rose-500">
                                            -{formatCurrency(p.total_deduction)}
                                        </td>
                                        <td className="px-5 py-4 text-right font-mono text-sm font-bold text-slate-900">
                                            {formatCurrency(p.net_salary)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Badge status={p.payment_status} />
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/employee/payrolls/${p.id}`}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#7950E8] hover:bg-[#F1ECFF] transition-colors"
                                                    title="Lihat Rincian"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/employee/payrolls/${p.id}/print`}
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
                                        <p className="font-medium text-slate-600">Belum ada slip gaji yang diterbitkan</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden divide-y divide-slate-100">
                    {payrolls?.data?.length > 0 ? (
                        payrolls.data.map((p) => (
                            <div key={p.id} className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">
                                            {p.period?.name || 'Periode Penggajian'}
                                        </h4>
                                        <p className="font-mono text-xs text-slate-400">
                                            Ref: {p.reference_number || 'DRAFT'}
                                        </p>
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
                                        <span className="text-slate-400 block text-[11px]">Tunjangan & Bonus</span>
                                        <span className="font-mono font-medium text-emerald-600">
                                            +{formatCurrency(parseFloat(p.total_allowance || 0) + parseFloat(p.total_bonus || 0))}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Potongan Pajak/BPJS</span>
                                        <span className="font-mono font-medium text-rose-500">
                                            -{formatCurrency(p.total_deduction)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px] font-semibold text-[#142B49]">
                                            Gaji Bersih
                                        </span>
                                        <span className="font-mono font-bold text-sm text-[#7950E8]">
                                            {formatCurrency(p.net_salary)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <Link
                                        href={`/employee/payrolls/${p.id}`}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#7950E8] bg-[#F1ECFF] hover:bg-[#7950E8]/20 transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Rincian Slip</span>
                                    </Link>
                                    <Link
                                        href={`/employee/payrolls/${p.id}/print`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Cetak Slip</span>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <Banknote className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            <p className="font-medium text-slate-600">Belum ada slip gaji</p>
                        </div>
                    )}
                </div>

                {payrolls && <Pagination pagination={payrolls} />}
            </div>
        </AppLayout>
    );
}
