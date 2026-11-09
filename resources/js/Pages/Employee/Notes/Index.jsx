import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Pagination from '../../../Components/Pagination';
import Modal from '../../../Components/Modal';
import {
    StickyNote,
    Plus,
    Search,
    Star,
    Trash2,
    Edit2,
    Calendar,
    Pin,
} from 'lucide-react';

export default function NotesIndex({ notes, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [onlyFavorite, setOnlyFavorite] = useState(Boolean(filters.favorite));

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);

    // Form
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        content: '',
        color: '#FFFFFF',
    });

    const noteColors = [
        { label: 'Putih', hex: '#FFFFFF', bg: 'bg-white', border: 'border-slate-200' },
        { label: 'Ungu Muda', hex: '#F5F0FF', bg: 'bg-[#F5F0FF]', border: 'border-[#E2D4FD]' },
        { label: 'Biru Muda', hex: '#EFF6FF', bg: 'bg-blue-50', border: 'border-blue-200' },
        { label: 'Kuning Muda', hex: '#FEF9C3', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        { label: 'Hijau Muda', hex: '#F0FDF4', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        { label: 'Merah Muda', hex: '#FFF1F2', bg: 'bg-rose-50', border: 'border-rose-200' },
    ];

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/employee/notes',
            { search, favorite: onlyFavorite ? 1 : 0 },
            { preserveState: true, replace: true }
        );
    };

    const toggleFavoriteFilter = () => {
        const nextFav = !onlyFavorite;
        setOnlyFavorite(nextFav);
        router.get(
            '/employee/notes',
            { search, favorite: nextFav ? 1 : 0 },
            { preserveState: true, replace: true }
        );
    };

    const handleToggleFavoriteNote = (noteId) => {
        router.patch(`/employee/notes/${noteId}/favorite`, {}, { preserveScroll: true });
    };

    const handleDeleteNote = (noteId, noteTitle) => {
        if (confirm(`Yakin ingin menghapus catatan "${noteTitle}"?`)) {
            router.delete(`/employee/notes/${noteId}`, { preserveScroll: true });
        }
    };

    const openCreateModal = () => {
        setEditingNote(null);
        reset();
        setData({ title: '', content: '', color: '#FFFFFF' });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (note) => {
        setEditingNote(note);
        setData({
            title: note.title,
            content: note.content,
            color: note.color || '#FFFFFF',
        });
        setIsCreateModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingNote) {
            put(`/employee/notes/${editingNote.id}`, {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/employee/notes', {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <AppLayout
            title="Catatan Pribadi (Personal Notes)"
            subtitle="Ruang catatan pribadi yang aman dan terenkripsi untuk menyimpan to-do internal, ide, referensi, atau memo penting"
        >
            <Head title="Catatan Pribadi - WorkTrack" />

            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] flex flex-col sm:flex-row items-center justify-between gap-3">
                <form onSubmit={handleFilter} className="flex items-center gap-2 flex-1 w-full">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari dalam catatan..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7950E8]"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={toggleFavoriteFilter}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                            onlyFavorite
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                    >
                        <Star className={`w-4 h-4 ${onlyFavorite ? 'fill-white' : ''}`} />
                        <span>Favorit</span>
                    </button>
                </form>

                <button
                    onClick={openCreateModal}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#7950E8] hover:bg-[#683fe0] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tulis Catatan Baru</span>
                </button>
            </div>

            {/* Notes Grid */}
            {notes?.data?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {notes.data.map((note) => (
                        <div
                            key={note.id}
                            className="p-5 rounded-2xl border shadow-[0_2px_10px_rgba(20,43,73,0.04)] flex flex-col justify-between transition-all hover:shadow-md relative group"
                            style={{
                                backgroundColor: note.color || '#FFFFFF',
                                borderColor: note.color && note.color !== '#FFFFFF' ? `${note.color}99` : '#E2E8F0',
                            }}
                        >
                            <div className="space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-bold text-slate-800 text-sm leading-snug break-words flex-1">
                                        {note.title}
                                    </h4>
                                    <button
                                        onClick={() => handleToggleFavoriteNote(note.id)}
                                        className="text-slate-300 hover:text-amber-500 transition-colors shrink-0 p-1"
                                        title={note.is_favorite ? 'Hapus dari favorit' : 'Tandai favorit'}
                                    >
                                        <Star
                                            className={`w-4 h-4 ${
                                                note.is_favorite
                                                    ? 'fill-amber-400 text-amber-500'
                                                    : 'text-slate-300'
                                            }`}
                                        />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed break-words">
                                    {note.content}
                                </p>
                            </div>

                            <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between text-slate-400 text-[11px]">
                                <span>
                                    {new Date(note.updated_at || note.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                    })}
                                </span>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(note)}
                                        className="p-1 text-slate-500 hover:text-[#7950E8] rounded transition-colors"
                                        title="Edit Catatan"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNote(note.id, note.title)}
                                        className="p-1 text-slate-500 hover:text-rose-500 rounded transition-colors"
                                        title="Hapus Catatan"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                    <StickyNote className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h4 className="font-bold text-slate-700 text-base">Belum Ada Catatan</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                        Gunakan catatan pribadi untuk mencatat ide spontan, checklist to-do mandiri, atau catatan penting saat bekerja.
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#7950E8] text-white rounded-xl text-xs font-semibold shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buat Catatan Pertama</span>
                    </button>
                </div>
            )}

            {notes && <Pagination pagination={notes} />}

            {/* Modal: Create / Edit Note */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={editingNote ? 'Edit Catatan' : 'Catatan Baru'}
                maxWidth="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Judul Catatan *
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Checklist Sebelum Rilis, Ide Integrasi API"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            required
                        />
                        {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Isi Catatan *
                        </label>
                        <textarea
                            rows={6}
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            placeholder="Tuliskan catatan, poin-poin ide, atau tautan..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#7950E8]"
                            required
                        />
                        {errors.content && <p className="text-xs text-rose-500 mt-1">{errors.content}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Warna Kartu
                        </label>
                        <div className="flex items-center gap-2">
                            {noteColors.map((color) => (
                                <button
                                    key={color.hex}
                                    type="button"
                                    onClick={() => setData('color', color.hex)}
                                    className={`w-7 h-7 rounded-full ${color.bg} border-2 transition-all ${
                                        data.color === color.hex
                                            ? 'border-[#7950E8] ring-2 ring-[#7950E8]/30 scale-110'
                                            : color.border
                                    }`}
                                    title={color.label}
                                />
                            ))}
                        </div>
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
                            {processing ? 'Menyimpan...' : 'Simpan Catatan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
