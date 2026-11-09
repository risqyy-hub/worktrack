import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function EmployeePrintSlip({ payroll }) {
    const { company } = usePage().props;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const allowances = payroll.items?.filter((item) => item.type === 'ALLOWANCE' || item.type === 'BONUS') || [];
    const deductions = payroll.items?.filter((item) => item.type === 'DEDUCTION') || [];

    const totalEarnings = (parseFloat(payroll.basic_salary) || 0) + (parseFloat(payroll.total_allowance) || 0) + (parseFloat(payroll.total_bonus) || 0);
    const totalDeductions = parseFloat(payroll.total_deduction) || 0;

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white text-slate-800 font-sans p-4 sm:p-8">
            <Head title={`Slip Gaji - ${payroll.period?.name}`} />

            {/* Print action bar (hidden in print) */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link
                    href={`/employee/payrolls/${payroll.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-sm font-semibold shadow-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Detail</span>
                </Link>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7950E8] hover:bg-[#683fe0] text-white rounded-xl text-sm font-semibold shadow-md transition-all"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Slip Gaji (PDF)</span>
                    </button>
                </div>
            </div>

            {/* Document Sheet */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl print:rounded-none border border-slate-200 print:border-none shadow-xl print:shadow-none p-8 sm:p-12 relative overflow-hidden">
                {/* Stamp if paid */}
                {payroll.payment_status === 'PAID' && (
                    <div className="absolute right-12 top-10 pointer-events-none opacity-20 print:opacity-30 border-4 border-emerald-600 text-emerald-700 font-black tracking-widest text-3xl px-6 py-2 rounded-xl rotate-12 uppercase select-none">
                        LUNAS / PAID
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-800 pb-6 mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#142B49] text-white font-black text-lg flex items-center justify-center">
                                WT
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-[#142B49] tracking-tight">
                                    {company?.name || 'PT WORKTRACK SOLUSI NUSANTARA'}
                                </h1>
                                <p className="text-xs text-slate-500 font-medium">
                                    {company?.tagline || 'Enterprise Operational & Workflow Management'}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 max-w-sm">
                            {company?.address || 'Jl. Jenderal Sudirman Kav. 52-53, Jakarta Selatan'}
                        </p>
                    </div>

                    <div className="sm:text-right">
                        <span className="inline-block px-3 py-1 bg-slate-100 rounded-md text-[11px] font-bold text-slate-700 uppercase tracking-widest mb-1">
                            SLIP GAJI KARYAWAN
                        </span>
                        <h2 className="text-sm font-mono font-bold text-slate-800">
                            {payroll.reference_number || 'DRAFT-REF'}
                        </h2>
                        <p className="text-xs text-slate-500">
                            Periode: <strong>{payroll.period?.name || '-'}</strong>
                        </p>
                        <p className="text-xs text-slate-500">
                            Tgl Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                        </p>
                    </div>
                </div>

                {/* Employee Data Grid */}
                <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-xs">
                    <div>
                        <span className="text-slate-400 block uppercase font-semibold text-[10px]">Nama Karyawan</span>
                        <span className="font-bold text-slate-800 text-sm">{payroll.employee?.user?.name}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block uppercase font-semibold text-[10px]">Nomor Induk Karyawan</span>
                        <span className="font-mono font-semibold text-slate-700">{payroll.employee?.employee_code || '-'}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block uppercase font-semibold text-[10px]">Jabatan / Posisi</span>
                        <span className="font-semibold text-slate-800">{payroll.employee?.position?.name || '-'}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block uppercase font-semibold text-[10px]">Departemen / Divisi</span>
                        <span className="font-medium text-slate-700">{payroll.employee?.department?.name || '-'}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block uppercase font-semibold text-[10px]">Rekening Pembayaran</span>
                        <span className="font-mono font-semibold text-slate-700">
                            {payroll.employee?.bank_name || 'BCA'} - {payroll.employee?.bank_account_number || '-'}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 block uppercase font-semibold text-[10px]">NPWP</span>
                        <span className="font-mono text-slate-600">{payroll.employee?.npwp || '-'}</span>
                    </div>
                </div>

                {/* Items Breakdown: 2 columns table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Earnings */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-[#142B49]/5 px-4 py-2.5 font-bold text-xs text-[#142B49] uppercase tracking-wider border-b border-slate-200 flex justify-between">
                            <span>A. Penerimaan (Earnings)</span>
                            <span>Jumlah</span>
                        </div>
                        <div className="p-4 space-y-2 text-xs divide-y divide-slate-100">
                            <div className="flex justify-between pt-1">
                                <span className="text-slate-700 font-medium">Gaji Pokok</span>
                                <span className="font-mono font-semibold text-slate-800">
                                    {formatCurrency(payroll.basic_salary)}
                                </span>
                            </div>
                            {allowances.map((item) => (
                                <div key={item.id} className="flex justify-between pt-2">
                                    <div>
                                        <span className="text-slate-700">{item.name}</span>
                                        {item.note && <p className="text-[10px] text-slate-400">{item.note}</p>}
                                    </div>
                                    <span className="font-mono text-slate-800">
                                        {formatCurrency(item.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-emerald-50/50 px-4 py-2 border-t border-slate-200 flex justify-between text-xs font-bold text-emerald-800">
                            <span>Total Penerimaan Kotor</span>
                            <span className="font-mono">{formatCurrency(totalEarnings)}</span>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-rose-50/50 px-4 py-2.5 font-bold text-xs text-rose-800 uppercase tracking-wider border-b border-slate-200 flex justify-between">
                            <span>B. Potongan (Deductions)</span>
                            <span>Jumlah</span>
                        </div>
                        <div className="p-4 space-y-2 text-xs divide-y divide-slate-100">
                            {deductions.map((item) => (
                                <div key={item.id} className="flex justify-between pt-2">
                                    <div>
                                        <span className="text-slate-700">{item.name}</span>
                                        {item.note && <p className="text-[10px] text-slate-400">{item.note}</p>}
                                    </div>
                                    <span className="font-mono text-rose-600">
                                        {formatCurrency(item.amount)}
                                    </span>
                                </div>
                            ))}
                            {deductions.length === 0 && (
                                <p className="text-slate-400 text-center py-4 text-xs italic">
                                    Tidak ada potongan untuk periode ini
                                </p>
                            )}
                        </div>
                        <div className="bg-rose-50 px-4 py-2 border-t border-slate-200 flex justify-between text-xs font-bold text-rose-800">
                            <span>Total Potongan</span>
                            <span className="font-mono">{formatCurrency(totalDeductions)}</span>
                        </div>
                    </div>
                </div>

                {/* Net Salary Box */}
                <div className="bg-[#142B49] text-white p-5 rounded-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-[11px] uppercase tracking-wider text-purple-200 font-semibold block">
                            Gaji Bersih Diterima (Take Home Pay = A - B)
                        </span>
                        <p className="text-xs text-purple-200 mt-0.5">
                            Status: <strong className="text-white">{payroll.payment_status}</strong>
                            {payroll.payment_method && ` • Via ${payroll.payment_method}`}
                        </p>
                    </div>
                    <div className="text-left sm:text-right">
                        <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                            {formatCurrency(payroll.net_salary)}
                        </span>
                    </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center text-xs">
                    <div>
                        <p className="text-slate-500 mb-16">Disetujui dan Dibayarkan Oleh,</p>
                        <p className="font-bold text-slate-800 border-b border-slate-300 pb-1 max-w-[200px] mx-auto">
                            General Manager
                        </p>
                        <p className="text-slate-400 text-[10px] mt-0.5">{company?.name || 'PT WorkTrack Solusi Nusantara'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 mb-16">Diterima Dengan Benar Oleh,</p>
                        <p className="font-bold text-slate-800 border-b border-slate-300 pb-1 max-w-[200px] mx-auto">
                            {payroll.employee?.user?.name}
                        </p>
                        <p className="text-slate-400 text-[10px] mt-0.5">NIK: {payroll.employee?.employee_code || '-'}</p>
                    </div>
                </div>

                {/* Confidential footer note */}
                <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
                    Dokumen ini dicetak otomatis secara elektronik oleh WorkTrack Management System dan bersifat rahasia (CONFIDENTIAL).
                </div>
            </div>
        </div>
    );
}
