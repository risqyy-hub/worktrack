import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Badge from '../../../Components/Badge';
import {
    FileText,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Clock,
    Paperclip,
    Download,
    MessageSquare,
    Send,
    User,
    Calendar,
    ChevronRight,
} from 'lucide-react';

export default function EmployeeReportShow({ report }) {
    const latestReview = report.reviews?.[0];
    const openRevision = report.revisions?.find((r) => r.status === 'OPEN');

    const revisionForm = useForm({
        response: '',
    });

    const handleRevisionSubmit = (e) => {
        e.preventDefault();
        revisionForm.post(`/employee/reports/${report.id}/revision-response`, {
            onSuccess: () => {
                revisionForm.reset();
            },
        });
    };

    return (
        <AppLayout
            title={`Laporan: ${report.report_code}`}
            subtitle={report.title}
        >
            <Head title={`${report.report_code} - Laporan Hasil Kerja - WorkTrack`} />

            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                <div className="flex items-center gap-3">
                    <Link
                        href="/employee/reports"
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Kembali ke Daftar Laporan"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">
                                {report.report_code}
                            </span>
                            <Badge status={report.status} />
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                            {report.title}
                        </h2>
                    </div>
                </div>

                <div className="text-xs text-slate-400">
                    Dikirim pada:{' '}
                    <strong className="text-slate-700">
                        {new Date(report.submitted_at || report.created_at).toLocaleString('id-ID')}
                    </strong>
                </div>
            </div>

            {/* Status Alert Banner */}
            {report.status === 'REVISION_REQUESTED' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm">Permintaan Revisi dari General Manager</h4>
                        <p className="text-xs text-amber-800 mt-0.5">
                            Silakan baca instruksi revisi di bawah ini dan kirimkan tanggapan perbaikan Anda.
                        </p>
                    </div>
                </div>
            )}

            {report.status === 'APPROVED' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm">Laporan Telah Disetujui (Approved)</h4>
                        <p className="text-xs text-emerald-800 mt-0.5">
                            Deliverable hasil pekerjaan Anda telah divalidasi dan disetujui secara resmi oleh General Manager.
                        </p>
                    </div>
                </div>
            )}

            {/* Split Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Report Details & Revision Response */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Work Description */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                            Deskripsi Rinci Hasil Pekerjaan
                        </h3>
                        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed">
                            {report.work_description}
                        </div>

                        {report.result_summary && (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                                <span className="font-bold text-slate-700 uppercase text-[10px]">Ringkasan Capaian:</span>
                                <p className="text-slate-600">{report.result_summary}</p>
                            </div>
                        )}

                        {report.obstacles && (
                            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 text-xs space-y-1">
                                <span className="font-bold text-rose-800 uppercase text-[10px]">Kendala / Catatan:</span>
                                <p className="text-rose-700">{report.obstacles}</p>
                            </div>
                        )}

                        {/* Attachments */}
                        {report.attachments?.length > 0 && (
                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>Lampiran Dokumen Bukti ({report.attachments.length})</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {report.attachments.map((file) => (
                                        <a
                                            key={file.id}
                                            href={`/storage/${file.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-xl border border-slate-200 hover:border-[#7950E8] bg-slate-50 hover:bg-white flex items-center justify-between text-xs transition-colors"
                                        >
                                            <div className="truncate pr-2">
                                                <p className="font-medium text-slate-800 truncate">{file.file_name}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    {(file.file_size / 1024).toFixed(0)} KB
                                                </p>
                                            </div>
                                            <Download className="w-4 h-4 text-slate-400 shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Revision Response Form (If revision requested) */}
                    {(report.status === 'REVISION_REQUESTED' || openRevision) && (
                        <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-amber-200 shadow-md space-y-4">
                            <div className="flex items-center gap-2 text-amber-700">
                                <MessageSquare className="w-5 h-5" />
                                <h3 className="font-bold text-base">Tanggapi Revisi dari GM</h3>
                            </div>

                            {(openRevision?.feedback_notes || openRevision?.revision_notes) && (
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs space-y-1">
                                    <span className="font-bold text-amber-900 block uppercase text-[10px]">
                                        Instruksi Revisi GM:
                                    </span>
                                    <p className="text-amber-800 whitespace-pre-line">
                                        {openRevision.feedback_notes || openRevision.revision_notes}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleRevisionSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                        Tanggapan Perbaikan & Pembaruan Hasil Kerja *
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={revisionForm.data.response}
                                        onChange={(e) => revisionForm.setData('response', e.target.value)}
                                        placeholder="Jelaskan penyesuaian yang telah dilakukan sesuai instruksi GM..."
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                                        required
                                    />
                                    {revisionForm.errors.response && (
                                        <p className="text-xs text-rose-500 mt-1">{revisionForm.errors.response}</p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={revisionForm.processing}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7950E8] hover:bg-[#683fe0] text-white rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-60"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>{revisionForm.processing ? 'Mengirim...' : 'Kirim Tanggapan Revisi ke GM'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Revision History */}
                    {report.revisions?.length > 0 && (
                        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#7950E8]" />
                                <span>Riwayat Siklus Revisi ({report.revisions.length})</span>
                            </h3>

                            <div className="space-y-3">
                                {report.revisions.map((rev, index) => (
                                    <div key={rev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                                        <div className="flex items-center justify-between font-bold text-slate-700">
                                            <span>Revisi #{report.revisions.length - index}</span>
                                            <Badge status={rev.status} />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-semibold text-slate-500">Catatan GM:</span>
                                            <p className="text-slate-800">{rev.feedback_notes || rev.revision_notes}</p>
                                        </div>
                                        {rev.employee_response && (
                                            <div className="space-y-1 pt-2 border-t border-slate-200">
                                                <span className="font-semibold text-[#7950E8]">Tanggapan Anda:</span>
                                                <p className="text-slate-800">{rev.employee_response}</p>
                                                <span className="text-[10px] text-slate-400 block">
                                                    Diselesaikan: {new Date(rev.resolved_at).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Task Meta & GM Evaluation */}
                <div className="space-y-6">
                    {/* GM Review Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Evaluasi General Manager
                        </h4>

                        {latestReview ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Keputusan Resmi</span>
                                    <Badge status={latestReview.decision} />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Peninjau</span>
                                    <span className="font-semibold text-slate-800">
                                        {latestReview.reviewer?.name || 'General Manager'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Waktu Penilaian</span>
                                    <span className="text-slate-600">
                                        {new Date(latestReview.created_at).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                {latestReview.notes && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                                            Catatan Evaluasi:
                                        </span>
                                        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            "{latestReview.notes}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-4 text-center text-slate-400 text-xs">
                                <Clock className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                                <p className="font-medium text-slate-600">Menunggu Evaluasi GM</p>
                                <p className="text-slate-400 mt-0.5">Laporan sedang dalam antrean review.</p>
                            </div>
                        )}
                    </div>

                    {/* Task Info */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-3 text-xs">
                        <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                            Informasi Tugas Asal
                        </h4>
                        <div className="space-y-2">
                            <p className="font-mono font-bold text-slate-400">{report.task?.task_code}</p>
                            <h5 className="font-bold text-slate-900 text-sm">{report.task?.title}</h5>
                            <Link
                                href={`/employee/tasks/${report.task_id}`}
                                className="inline-flex items-center gap-1 text-[#7950E8] hover:underline font-semibold pt-1"
                            >
                                <span>Lihat Lembar Tugas</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
