import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Badge from '../../../Components/Badge';
import Modal from '../../../Components/Modal';
import {
    CheckSquare,
    Clock,
    Calendar,
    ArrowLeft,
    Play,
    CheckCircle2,
    Paperclip,
    FileText,
    TrendingUp,
    Send,
    Plus,
    MessageSquare,
    User,
    AlertCircle,
    Download,
} from 'lucide-react';

export default function EmployeeTaskShow({ task, assignment }) {
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Form for updating progress
    const progressForm = useForm({
        progress_percent: assignment.progress_percent || 10,
        note: '',
    });

    // Form for submitting report
    const reportForm = useForm({
        task_assignment_id: assignment.id,
        title: `Laporan Hasil Pekerjaan: ${task.title}`,
        work_description: '',
        result_summary: '',
        obstacles: '',
        progress_percent: 100,
        attachments: [],
    });

    const isOverdue =
        new Date(task.due_date) < new Date() && assignment.status !== 'COMPLETED';

    const handleStartTask = () => {
        router.post(`/employee/tasks/${task.id}/start`);
    };

    const handleProgressSubmit = (e) => {
        e.preventDefault();
        progressForm.post(`/employee/tasks/${task.id}/progress`, {
            onSuccess: () => {
                setIsProgressModalOpen(false);
                progressForm.reset('note');
            },
        });
    };

    const handleReportSubmit = (e) => {
        e.preventDefault();
        reportForm.post('/employee/reports', {
            onSuccess: () => {
                setIsReportModalOpen(false);
            },
        });
    };

    return (
        <AppLayout
            title={`Tugas: ${task.task_code}`}
            subtitle={task.title}
        >
            <Head title={`${task.task_code} - ${task.title} - WorkTrack`} />

            {/* Top Bar Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                <div className="flex items-center gap-3">
                    <Link
                        href="/employee/tasks"
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Kembali ke Daftar"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-500">
                                {task.task_code}
                            </span>
                            <Badge status={task.priority} />
                            <Badge status={assignment.status} />
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                            {task.title}
                        </h2>
                    </div>
                </div>

                {/* Actions based on assignment status */}
                <div className="flex items-center gap-2 flex-wrap">
                    {(assignment.status === 'TODO' || assignment.status === 'UPCOMING') && (
                        <button
                            onClick={handleStartTask}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7950E8] hover:bg-[#683fe0] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Mulai Kerjakan Tugas</span>
                        </button>
                    )}

                    {assignment.status !== 'COMPLETED' && (
                        <>
                            <button
                                onClick={() => setIsProgressModalOpen(true)}
                                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span>Update Progres</span>
                            </button>
                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#142B49] hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm"
                            >
                                <Send className="w-4 h-4" />
                                <span>Kirim Laporan Hasil</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Details, Deliverables & Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Task Description Card */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-400">
                            Deskripsi & Petunjuk Kerja GM
                        </h3>
                        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed">
                            {task.description || 'Tidak ada deskripsi rinci untuk tugas ini.'}
                        </div>

                        {/* Attachments from GM */}
                        {task.attachments?.length > 0 && (
                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>Lampiran Referensi dari GM ({task.attachments.length})</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {task.attachments.map((file) => (
                                        <a
                                            key={file.id}
                                            href={`/storage/${file.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 rounded-xl border border-slate-200 hover:border-[#7950E8] bg-slate-50 hover:bg-white flex items-center justify-between text-xs transition-colors"
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

                    {/* Reports Submitted */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#7950E8]" />
                                <span>Laporan Hasil Pekerjaan</span>
                            </h3>
                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="text-xs font-semibold text-[#7950E8] hover:underline"
                            >
                                + Kirim Laporan Baru
                            </button>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {task.reports?.length > 0 ? (
                                task.reports.map((r) => (
                                    <div key={r.id} className="py-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-slate-500">
                                                        {r.report_code}
                                                    </span>
                                                    <Badge status={r.status} />
                                                </div>
                                                <Link
                                                    href={`/employee/reports/${r.id}`}
                                                    className="font-bold text-slate-900 text-sm hover:text-[#7950E8] block mt-1"
                                                >
                                                    {r.title}
                                                </Link>
                                            </div>
                                            <Link
                                                href={`/employee/reports/${r.id}`}
                                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
                                            >
                                                Detail
                                            </Link>
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-2">
                                            {r.work_description}
                                        </p>
                                        {r.reviews?.length > 0 && (
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                                                <div className="flex items-center justify-between font-semibold text-slate-700">
                                                    <span>Review oleh: {r.reviews[0].reviewer?.name || 'General Manager'}</span>
                                                    <Badge status={r.reviews[0].decision} />
                                                </div>
                                                <p className="text-slate-600 italic">
                                                    "{r.reviews[0].notes || 'Tidak ada catatan.'}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 py-6 text-center">
                                    Belum ada laporan hasil yang dikirim untuk tugas ini.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Progress History Timeline */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#7950E8]" />
                            <span>Riwayat Pembaruan Progres</span>
                        </h3>

                        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {task.progresses?.length > 0 ? (
                                task.progresses.map((p) => (
                                    <div key={p.id} className="relative">
                                        <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#7950E8] border-2 border-white shadow-sm" />
                                        <div className="text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-slate-800 text-sm">
                                                    {p.progress_percent}%
                                                </span>
                                                <span className="text-slate-400">
                                                    {new Date(p.created_at).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 mt-1">{p.note}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 py-2">Belum ada riwayat pembaruan progres.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Parameters & Meta */}
                <div className="space-y-6">
                    {/* Status & Assignment Box */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Parameter Pengerjaan
                        </h4>

                        {/* Progress Meter */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-700">Progres Kerja Saya</span>
                                <span className="font-mono font-bold text-base text-[#7950E8]">
                                    {assignment.progress_percent}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#7950E8] h-full rounded-full transition-all duration-300"
                                    style={{ width: `${assignment.progress_percent}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 text-xs divide-y divide-slate-100">
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-slate-500">Status Tugas</span>
                                <Badge status={assignment.status} />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-slate-500">Tingkat Prioritas</span>
                                <Badge status={task.priority} />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-slate-500">Tenggat Waktu</span>
                                <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {new Date(task.due_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-slate-500">Didelegasikan Oleh</span>
                                <span className="font-semibold text-slate-800">
                                    {task.creator?.name || 'General Manager'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-slate-500">Estimasi Beban</span>
                                <span className="font-mono font-semibold text-slate-800">
                                    {task.estimated_hours ? `${task.estimated_hours} Jam` : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Update Progress */}
            <Modal
                isOpen={isProgressModalOpen}
                onClose={() => setIsProgressModalOpen(false)}
                title="Pembaruan Progres Tugas"
                maxWidth="md"
            >
                <form onSubmit={handleProgressSubmit} className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-semibold text-slate-700 uppercase">
                                Progres Pekerjaan (%) *
                            </label>
                            <span className="text-sm font-mono font-bold text-[#7950E8]">
                                {progressForm.data.progress_percent}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={progressForm.data.progress_percent}
                            onChange={(e) => progressForm.setData('progress_percent', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#7950E8]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Catatan Pengerjaan / Capaian Hari Ini *
                        </label>
                        <textarea
                            rows={3}
                            value={progressForm.data.note}
                            onChange={(e) => progressForm.setData('note', e.target.value)}
                            placeholder="Jelaskan deliverable yang telah selesai dikerjakan..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            required
                        />
                        {progressForm.errors.note && (
                            <p className="text-xs text-rose-500 mt-1">{progressForm.errors.note}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsProgressModalOpen(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={progressForm.processing}
                            className="px-5 py-2 text-sm font-semibold text-white bg-[#7950E8] hover:bg-[#683fe0] rounded-xl transition-all shadow-md disabled:opacity-60"
                        >
                            {progressForm.processing ? 'Menyimpan...' : 'Simpan Progres'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Submit Report */}
            <Modal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Kirim Laporan Hasil Pekerjaan ke GM"
                maxWidth="lg"
            >
                <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Judul Laporan *
                        </label>
                        <input
                            type="text"
                            value={reportForm.data.title}
                            onChange={(e) => reportForm.setData('title', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            required
                        />
                        {reportForm.errors.title && (
                            <p className="text-xs text-rose-500 mt-1">{reportForm.errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Deskripsi Hasil Pekerjaan Lengkap *
                        </label>
                        <textarea
                            rows={4}
                            value={reportForm.data.work_description}
                            onChange={(e) => reportForm.setData('work_description', e.target.value)}
                            placeholder="Rincikan seluruh pekerjaan yang telah diselesaikan, link hasil, dokumen, dsb..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            required
                        />
                        {reportForm.errors.work_description && (
                            <p className="text-xs text-rose-500 mt-1">{reportForm.errors.work_description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Ringkasan Capaian
                            </label>
                            <textarea
                                rows={2}
                                value={reportForm.data.result_summary}
                                onChange={(e) => reportForm.setData('result_summary', e.target.value)}
                                placeholder="Inti deliverable..."
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Kendala / Hambatan (Opsional)
                            </label>
                            <textarea
                                rows={2}
                                value={reportForm.data.obstacles}
                                onChange={(e) => reportForm.setData('obstacles', e.target.value)}
                                placeholder="Jika ada kendala..."
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Lampiran Bukti Kerja (File PDF, ZIP, Gambar, Dokumen max 10MB)
                        </label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => reportForm.setData('attachments', Array.from(e.target.files))}
                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#F1ECFF] file:text-[#7950E8] hover:file:bg-[#7950E8]/20"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsReportModalOpen(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={reportForm.processing}
                            className="px-6 py-2 text-sm font-semibold text-white bg-[#7950E8] hover:bg-[#683fe0] rounded-xl transition-all shadow-md disabled:opacity-60"
                        >
                            {reportForm.processing ? 'Mengirim...' : 'Kirim Laporan Resmi'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
