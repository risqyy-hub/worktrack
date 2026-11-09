import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Badge from '../../../Components/Badge';
import {
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    XCircle,
    FileText,
    Download,
    Paperclip,
    User,
    Clock,
    AlertTriangle,
    ShieldCheck,
} from 'lucide-react';

export default function ReportShow({ report }) {
    const { data, setData, post, processing, errors } = useForm({
        status: 'APPROVED',
        notes: '',
    });

    const submitReview = (e) => {
        e.preventDefault();
        post(`/gm/reports/${report.id}/review`);
    };

    return (
        <AppLayout
            title={`Review Laporan: ${report.report_code}`}
            subtitle={report.title}
        >
            <Head title={`Laporan ${report.report_code} - WorkTrack`} />

            {/* Back Navigation */}
            <div>
                <Link
                    href="/gm/reports"
                    className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-[#1769E8] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Laporan</span>
                </Link>
            </div>

            {/* Main Report Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {report.report_code}
                            </span>
                            <Badge status={report.status} size="sm" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#142B49] leading-snug">
                            {report.title}
                        </h2>
                        <p className="text-xs text-slate-500">
                            Tugas: <span className="font-semibold text-slate-700">{report.task?.title}</span> ({report.task?.task_code})
                        </p>
                    </div>

                    <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-3.5 flex items-center space-x-3 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-[#1769E8] text-white font-bold flex items-center justify-center shrink-0">
                            {report.employee?.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="text-xs">
                            <p className="font-bold text-[#142B49]">{report.employee?.user?.name}</p>
                            <p className="text-slate-500">{report.employee?.position?.name} • {report.employee?.department?.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Dikirim: {report.submitted_at}</p>
                        </div>
                    </div>
                </div>

                {/* Report Content Sections */}
                <div className="space-y-4">
                    {/* Deskripsi Pekerjaan */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Deskripsi Pelaksanaan Pekerjaan
                        </h4>
                        <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line">
                            {report.work_description}
                        </div>
                    </div>

                    {/* Ringkasan Hasil Pekerjaan */}
                    {report.result_summary && (
                        <div>
                            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Hasil Capaian / Deliverable
                            </h4>
                            <div className="text-sm text-emerald-950 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60 whitespace-pre-line">
                                {report.result_summary}
                            </div>
                        </div>
                    )}

                    {/* Kendala / Hambatan */}
                    {report.obstacles && (
                        <div>
                            <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center">
                                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                Kendala & Solusi Lapangan
                            </h4>
                            <div className="text-sm text-amber-950 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 whitespace-pre-line">
                                {report.obstacles}
                            </div>
                        </div>
                    )}

                    {/* Lampiran */}
                    {report.attachments && report.attachments.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                                <Paperclip className="w-3.5 h-3.5 mr-1" />
                                Lampiran Bukti / File Hasil ({report.attachments.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {report.attachments.map((file) => (
                                    <a
                                        key={file.id}
                                        href={`/storage/${file.file_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs transition-colors"
                                    >
                                        <div className="flex items-center space-x-2 truncate pr-2">
                                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                            <span className="font-semibold text-slate-800 truncate">{file.file_name}</span>
                                        </div>
                                        <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* GM Review Action Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-5">
                <div className="pb-3 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-[#142B49] flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2 text-[#1769E8]" />
                        Formulir Evaluasi & Keputusan General Manager
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Tentukan apakah pekerjaan ini disetujui, memerlukan revisi, atau ditolak
                    </p>
                </div>

                <form onSubmit={submitReview} className="space-y-4">
                    {/* Radio Decision Cards */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Keputusan Evaluasi *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <label
                                className={`p-4 rounded-2xl border-2 flex items-center space-x-3 cursor-pointer transition-all ${
                                    data.status === 'APPROVED'
                                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value="APPROVED"
                                    checked={data.status === 'APPROVED'}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="text-emerald-600 focus:ring-emerald-500"
                                />
                                <div>
                                    <span className="block font-bold text-sm">Disetujui</span>
                                    <span className="block text-[11px] opacity-75">Tugas selesai sempurna</span>
                                </div>
                            </label>

                            <label
                                className={`p-4 rounded-2xl border-2 flex items-center space-x-3 cursor-pointer transition-all ${
                                    data.status === 'REVISION_REQUESTED'
                                        ? 'border-orange-500 bg-orange-50/50 text-orange-900 shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value="REVISION_REQUESTED"
                                    checked={data.status === 'REVISION_REQUESTED'}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="text-orange-600 focus:ring-orange-500"
                                />
                                <div>
                                    <span className="block font-bold text-sm">Minta Revisi</span>
                                    <span className="block text-[11px] opacity-75">Perlu perbaikan karyawan</span>
                                </div>
                            </label>

                            <label
                                className={`p-4 rounded-2xl border-2 flex items-center space-x-3 cursor-pointer transition-all ${
                                    data.status === 'REJECTED'
                                        ? 'border-rose-500 bg-rose-50/50 text-rose-900 shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value="REJECTED"
                                    checked={data.status === 'REJECTED'}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="text-rose-600 focus:ring-rose-500"
                                />
                                <div>
                                    <span className="block font-bold text-sm">Tolak Laporan</span>
                                    <span className="block text-[11px] opacity-75">Tidak sesuai ekspektasi</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Review Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Catatan & Instruksi Evaluasi *
                        </label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Tuliskan catatan review, saran, atau poin-poin yang wajib diperbaiki..."
                            required
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                        />
                        {errors.notes && <p className="text-xs text-rose-600 mt-1">{errors.notes}</p>}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-3 rounded-xl bg-[#1769E8] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-colors min-h-[44px]"
                        >
                            {processing ? 'Menyimpan Review...' : 'Simpan & Kirim Evaluasi'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Review & Revision History Thread */}
            {(report.reviews?.length > 0 || report.revisions?.length > 0) && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                    <h3 className="text-base font-bold text-[#142B49] pb-3 border-b border-slate-100 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-slate-500" />
                        Histori Evaluasi & Alur Revisi
                    </h3>

                    <div className="space-y-3">
                        {report.reviews?.map((rev) => (
                            <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Badge status={rev.status} size="xs" />
                                        <span className="font-bold text-slate-800">Review oleh {rev.reviewer?.name || 'GM'}</span>
                                    </div>
                                    <span className="text-slate-400">{rev.reviewed_at}</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{rev.notes}</p>
                            </div>
                        ))}

                        {report.revisions?.map((r) => (
                            <div key={r.id} className="p-4 rounded-2xl bg-orange-50/40 border border-orange-200/50 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-orange-900">
                                        Revisi #{r.revision_number} • Status: {r.status}
                                    </span>
                                    {r.resolved_at && <span className="text-slate-400">Terselesaikan: {r.resolved_at}</span>}
                                </div>
                                <p className="text-orange-950"><strong>Feedback GM:</strong> {r.feedback_notes}</p>
                                {r.employee_response && (
                                    <div className="mt-2 p-2.5 bg-white rounded-xl border border-orange-200">
                                        <strong className="text-slate-800">Tanggapan Karyawan:</strong>
                                        <p className="text-slate-600 mt-0.5">{r.employee_response}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
