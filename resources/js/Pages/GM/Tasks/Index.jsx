import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Modal from '../../../Components/Modal';
import Badge from '../../../Components/Badge';
import Pagination from '../../../Components/Pagination';
import EmployeeSearchSelect from '../../../Components/EmployeeSearchSelect';
import {
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    Calendar,
    Users,
    Paperclip,
    CheckCircle2,
    Clock,
    AlertOctagon,
    XCircle,
} from 'lucide-react';

export default function TasksIndex({ tasks, categories, counts, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [activeTab, setActiveTab] = useState(filters.status || 'ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        priority: 'MEDIUM',
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        description: '',
        additional_instructions: '',
        employee_ids: [],
        attachments: [],
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/gm/tasks',
            { search, priority, category_id: categoryId, status: activeTab },
            { preserveState: true, replace: true }
        );
    };

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        router.get(
            '/gm/tasks',
            { search, priority, category_id: categoryId, status: tabKey },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        reset();
        setEditingTask(null);
        if (categories.length > 0) {
            setData('category_id', categories[0].id);
        }
        setIsCreateModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setData({
            title: task.title,
            category_id: task.category_id,
            priority: task.priority,
            start_date: task.start_date,
            due_date: task.due_date,
            description: task.description || '',
            additional_instructions: task.additional_instructions || '',
            employee_ids: task.assignments?.map((a) => a.employee_id) || [],
            attachments: [],
        });
        setIsCreateModalOpen(true);
    };

    const submitTask = (e) => {
        e.preventDefault();
        if (editingTask) {
            put(`/gm/tasks/${editingTask.id}`, {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/gm/tasks', {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                },
            });
        }
    };

    const cancelTask = (task) => {
        if (confirm(`Batalkan tugas ${task.task_code}?`)) {
            router.patch(`/gm/tasks/${task.id}/status`, { status: 'CANCELLED' });
        }
    };

    const deleteTask = (task) => {
        if (confirm(`Hapus permanen tugas ${task.task_code}?`)) {
            router.delete(`/gm/tasks/${task.id}`);
        }
    };

    const tabsList = [
        { key: 'ALL', label: 'Semua Tugas' },
        { key: 'UPCOMING', label: 'Mendatang' },
        { key: 'TODO', label: 'Belum Mulai' },
        { key: 'IN_PROGRESS', label: 'Dalam Proses' },
        { key: 'IN_REVIEW', label: 'Review' },
        { key: 'COMPLETED', label: 'Selesai' },
        { key: 'OVERDUE', label: 'Terlambat' },
        { key: 'CANCELLED', label: 'Dibatalkan' },
    ];

    return (
        <AppLayout
            title="Delegasi & Monitoring Tugas"
            subtitle="Buat penugasan karyawan baru, pantau timeline, dan progres kerja operasional"
        >
            <Head title="Delegasi Tugas - WorkTrack" />

            {/* Top Bar with Filter & Create Button */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Search and Filters */}
                    <form onSubmit={handleFilter} className="flex-1 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul atau kode tugas..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                            />
                        </div>

                        <select
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                router.get(
                                    '/gm/tasks',
                                    { search, priority, category_id: e.target.value, status: activeTab },
                                    { preserveState: true }
                                );
                            }}
                            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={priority}
                            onChange={(e) => {
                                setPriority(e.target.value);
                                router.get(
                                    '/gm/tasks',
                                    { search, priority: e.target.value, category_id: categoryId, status: activeTab },
                                    { preserveState: true }
                                );
                            }}
                            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white"
                        >
                            <option value="">Semua Prioritas</option>
                            <option value="LOW">Rendah (LOW)</option>
                            <option value="MEDIUM">Sedang (MEDIUM)</option>
                            <option value="HIGH">Tinggi (HIGH)</option>
                            <option value="URGENT">Mendesak (URGENT)</option>
                        </select>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#142B49] hover:bg-[#0F1F35] text-white text-sm font-semibold rounded-xl transition-colors min-h-[40px]"
                        >
                            Filter
                        </button>
                    </form>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 shrink-0">
                        <a
                            href="/gm/export/tasks"
                            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors min-h-[40px]"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Export CSV</span>
                        </a>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#1769E8] hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-colors min-h-[40px]"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Delegasikan Tugas</span>
                        </button>
                    </div>
                </div>

                {/* Status Tabs with Counters */}
                <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-slate-100 pb-1 scrollbar-none">
                    {tabsList.map((tab) => {
                        const count = counts[tab.key] || 0;
                        const isCurrent = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors min-h-[36px] shrink-0 ${
                                    isCurrent
                                        ? 'bg-[#142B49] text-white'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                        isCurrent
                                            ? 'bg-white/20 text-white'
                                            : tab.key === 'OVERDUE' && count > 0
                                                ? 'bg-rose-100 text-rose-700'
                                                : 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Tugas & Kategori</th>
                                <th className="px-6 py-4">Prioritas</th>
                                <th className="px-6 py-4">Penerima Tugas</th>
                                <th className="px-6 py-4">Tenggat Waktu</th>
                                <th className="px-6 py-4">Status & Progres</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {tasks.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        Tidak ada tugas ditemukan pada tab ini.
                                    </td>
                                </tr>
                            ) : (
                                tasks.data.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {task.task_code}
                                                    </span>
                                                    {task.category && (
                                                        <span
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                            style={{
                                                                backgroundColor: `${task.category.color}15`,
                                                                color: task.category.color,
                                                            }}
                                                        >
                                                            {task.category.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <Link
                                                    href={`/gm/tasks/${task.id}`}
                                                    className="font-bold text-[#142B49] hover:text-[#1769E8] transition-colors line-clamp-1 block"
                                                >
                                                    {task.title}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge status={task.priority} size="xs" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1.5">
                                                {task.assignments?.slice(0, 3).map((assign) => (
                                                    <div
                                                        key={assign.id}
                                                        title={assign.employee?.user?.name}
                                                        className="w-7 h-7 rounded-full bg-blue-100 text-[#1769E8] text-xs font-bold flex items-center justify-center border-2 border-white"
                                                    >
                                                        {assign.employee?.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                ))}
                                                {task.assignments?.length > 3 && (
                                                    <span className="text-xs text-slate-500 font-semibold">
                                                        +{task.assignments.length - 3}
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-700 ml-1">
                                                    {task.assignments?.[0]?.employee?.user?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className={`text-xs font-semibold ${task.is_overdue ? 'text-rose-600' : 'text-slate-700'}`}>
                                                {task.due_date}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                Mulai: {task.start_date}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <Badge status={task.effective_status} size="xs" />
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                task.status === 'COMPLETED'
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-[#1769E8]'
                                                            }`}
                                                            style={{ width: `${task.progress_percent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-600">
                                                        {task.progress_percent}%
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <Link
                                                    href={`/gm/tasks/${task.id}`}
                                                    className="p-2 text-slate-400 hover:text-[#1769E8] hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Lihat Detail & Laporan"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(task)}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Edit Tugas"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {task.status !== 'CANCELLED' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => cancelTask(task)}
                                                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Batalkan Tugas"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteTask(task)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={tasks.links} from={tasks.from} to={tasks.to} total={tasks.total} />
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3">
                {tasks.data.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100 text-xs">
                        Tidak ada tugas ditemukan.
                    </div>
                ) : (
                    tasks.data.map((task) => (
                        <div
                            key={task.id}
                            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(20,43,73,0.03)] space-y-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {task.task_code}
                                        </span>
                                        <Badge status={task.priority} size="xs" />
                                        <Badge status={task.effective_status} size="xs" />
                                    </div>
                                    <Link
                                        href={`/gm/tasks/${task.id}`}
                                        className="font-bold text-sm text-[#142B49] block leading-tight line-clamp-2"
                                    >
                                        {task.title}
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500">Penerima Tugas:</span>
                                    <span className="font-semibold text-slate-800">
                                        {task.assignments?.map((a) => a.employee?.user?.name).join(', ') || '-'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500">Tenggat Waktu:</span>
                                    <span className={`font-semibold ${task.is_overdue ? 'text-rose-600' : 'text-slate-800'}`}>
                                        {task.due_date}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                                        <span>Progres</span>
                                        <span>{task.progress_percent}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#1769E8] rounded-full" style={{ width: `${task.progress_percent}%` }} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100">
                                <Link
                                    href={`/gm/tasks/${task.id}`}
                                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors min-h-[36px] flex items-center"
                                >
                                    Detail
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => openEditModal(task)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors min-h-[36px]"
                                >
                                    Edit
                                </button>
                                {task.status !== 'CANCELLED' && (
                                    <button
                                        type="button"
                                        onClick={() => cancelTask(task)}
                                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors min-h-[36px]"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <Pagination links={tasks.links} from={tasks.from} to={tasks.to} total={tasks.total} />
            </div>

            {/* Task Delegation Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={editingTask ? 'Edit Detail Tugas' : 'Formulir Delegasi Tugas'}
                subtitle="Tugaskan pekerjaan kepada karyawan terpilih dengan tenggat waktu dan instruksi detail"
                maxWidth="max-w-3xl"
            >
                <form onSubmit={submitTask} className="space-y-4">
                    {/* Judul Tugas */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Judul Tugas *
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Optimasi Indexing Database & Migrasi Server"
                            required
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                        />
                        {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
                    </div>

                    {/* Interactive Employee Search Autocomplete (Only on create) */}
                    {!editingTask && (
                        <EmployeeSearchSelect
                            selectedIds={data.employee_ids}
                            onChange={(ids) => setData('employee_ids', ids)}
                            error={errors.employee_ids}
                        />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Kategori */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Kategori Tugas *
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                required
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && <p className="text-xs text-rose-600 mt-1">{errors.category_id}</p>}
                        </div>

                        {/* Prioritas */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Prioritas *
                            </label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                required
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                            >
                                <option value="LOW">Rendah (LOW)</option>
                                <option value="MEDIUM">Sedang (MEDIUM)</option>
                                <option value="HIGH">Tinggi (HIGH)</option>
                                <option value="URGENT">Mendesak (URGENT)</option>
                            </select>
                            {errors.priority && <p className="text-xs text-rose-600 mt-1">{errors.priority}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Tanggal Mulai */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Tanggal Mulai *
                            </label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                required
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                            />
                            {errors.start_date && <p className="text-xs text-rose-600 mt-1">{errors.start_date}</p>}
                        </div>

                        {/* Tenggat Waktu / Deadline */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Tenggat Waktu (Deadline) *
                            </label>
                            <input
                                type="date"
                                value={data.due_date}
                                min={data.start_date}
                                onChange={(e) => setData('due_date', e.target.value)}
                                required
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                            />
                            {errors.due_date && <p className="text-xs text-rose-600 mt-1">{errors.due_date}</p>}
                        </div>
                    </div>

                    {/* Deskripsi Tugas */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Deskripsi Lingkup Pekerjaan
                        </label>
                        <textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Rincian output yang diharapkan dan standar pekerjaan..."
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                        />
                    </div>

                    {/* Instruksi Tambahan */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Instruksi Khusus / Standar SOP
                        </label>
                        <textarea
                            rows={2}
                            value={data.additional_instructions}
                            onChange={(e) => setData('additional_instructions', e.target.value)}
                            placeholder="Contoh: Harap submit preview sebelum hari Kamis pukul 15.00 WIB."
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                        />
                    </div>

                    {/* Lampiran Dokumen */}
                    {!editingTask && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Lampiran Dokumen / Brief (Opsional)
                            </label>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setData('attachments', Array.from(e.target.files))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1769E8] hover:file:bg-blue-100"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors min-h-[44px]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-[#1769E8] hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-colors min-h-[44px]"
                        >
                            {processing ? 'Menyimpan...' : editingTask ? 'Simpan Perubahan' : 'Kirim Delegasi Tugas'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
