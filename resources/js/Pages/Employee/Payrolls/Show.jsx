import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Badge from '../../../Components/Badge';
import {
    Banknote,
    Printer,
    ArrowLeft,
    ShieldCheck,
    CreditCard,
    Calendar,
    Building2,
    FileText,
} from 'lucide-react';

export default function EmployeePayrollShow({ payroll }) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const allowances = payroll.items?.filter((item) => item.type === 'ALLOWANCE' || item.type === 'BONUS') || [];
    const deductions = payroll.items?.filter((item) => item.type === 'DEDUCTION') || [];
    const isPaid = payroll.payment_status === 'PAID';

    return (
        <AppLayout
            title={`Slip Gaji: ${payroll.period?.name || 'Periode'}`}
            subtitle={`Ref: ${payroll.reference_number || 'DRAFT'} • Tanggal: ${new Date(payroll.created_at).toLocaleDateString('id-ID')}`}
        >
            <Head title={`Slip Gaji ${payroll.period?.name} - WorkTrack`} />

            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                <div className="flex items-center gap-3">
                    <Link
                        href="/employee/payrolls"
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Kembali"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">
                                {payroll.period?.name}
                            </h2>
                            <Badge status={payroll.payment_status} />
                        </div>
                        <p className="text-xs text-slate-400">
                            No. Referensi: {payroll.reference_number || 'DRAFT'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/employee/payrolls/${payroll.id}/print`}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#7950E8] hover:bg-[#683fe0] rounded-xl transition-all shadow-md"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Slip Resmi (PDF)</span>
                    </Link>
                </div>
            </div>

            {/* Formula Highlight Banner */}
            <div className="bg-gradient-to-r from-[#142B49] to-[#7950E8] text-white p-5 rounded-2xl shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-[11px] uppercase tracking-wider text-purple-200 font-semibold block">
                            Formula Gaji Bersih (Take Home Pay)
                        </span>
                        <div className="text-xs sm:text-sm font-mono mt-1 text-purple-100">
                            GAJI BERSIH = GAJI POKOK + TOTAL TUNJANGAN + BONUS - TOTAL POTONGAN
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <span className="text-[11px] uppercase tracking-wider text-purple-200 font-semibold block">
                            Total Gaji Bersih Diterima
                        </span>
                        <span className="text-2xl sm:text-3xl font-mono font-black text-white">
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
                        Data Karyawan & Rekening
                    </h3>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">Nama Pegawai</span>
                            <span className="font-semibold text-slate-800">{payroll.employee?.user?.name}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">NIK</span>
                            <span className="font-mono text-xs font-semibold text-slate-700">
                                {payroll.employee?.employee_code || '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">Jabatan & Divisi</span>
                            <span className="text-slate-800 font-medium text-xs">
                                {payroll.employee?.position?.name} • {payroll.employee?.department?.name}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">Bank Rekening</span>
                            <span className="font-semibold text-slate-800">{payroll.employee?.bank_name || 'BCA'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">No. Rekening</span>
                            <span className="font-mono font-bold text-slate-900">
                                {payroll.employee?.bank_account_number || '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-slate-500 text-xs">NPWP</span>
                            <span className="font-mono text-xs text-slate-700">{payroll.employee?.npwp || '-'}</span>
                        </div>
                    </div>

                    {isPaid && (
                        <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Gaji Telah Ditransfer</span>
                            </div>
                            <p className="text-[11px] text-emerald-700">
                                Metode: {payroll.payment_method || 'Bank Transfer'}
                            </p>
                            <p className="text-[11px] text-emerald-700 font-mono">
                                No Ref: {payroll.reference_number || '-'}
                            </p>
                            {payroll.paid_at && (
                                <p className="text-[11px] text-emerald-600">
                                    Tanggal: {new Date(payroll.paid_at).toLocaleString('id-ID')}
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
                                <div key={item.id} className="flex items-center justify-between py-2.5">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-800">{item.name}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                                                {item.type}
                                            </span>
                                        </div>
                                        {item.note && <p className="text-[11px] text-slate-400">{item.note}</p>}
                                    </div>
                                    <span className="font-mono font-medium text-emerald-600">
                                        +{formatCurrency(item.amount)}
                                    </span>
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
                                    Potongan Wajib & Lainnya
                                </h3>
                            </div>
                            <span className="text-xs font-mono font-bold text-rose-500">
                                -{formatCurrency(payroll.total_deduction)}
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100 text-sm">
                            {deductions.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2.5">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-800">{item.name}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">
                                                POTONGAN
                                            </span>
                                        </div>
                                        {item.note && <p className="text-[11px] text-slate-400">{item.note}</p>}
                                    </div>
                                    <span className="font-mono font-medium text-rose-500">
                                        -{formatCurrency(item.amount)}
                                    </span>
                                </div>
                            ))}

                            {deductions.length === 0 && (
                                <p className="text-xs text-slate-400 py-3 text-center">
                                    Tidak ada potongan untuk periode ini.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
