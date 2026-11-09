import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Modal from '../../../Components/Modal';
import Badge from '../../../Components/Badge';
import {
    Building2,
    Briefcase,
    Tag,
    Settings,
    Plus,
    Edit2,
    CheckCircle2,
    XCircle,
    Save,
    Layers,
    DollarSign,
    Users,
} from 'lucide-react';

export default function MasterDataIndex({
    departments = [],
    positions = [],
    categories = [],
    settings = {},
}) {
    const [activeTab, setActiveTab] = useState('DEPARTMENTS');

    // Modals
    const [deptModalOpen, setDeptModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);

    const [posModalOpen, setPosModalOpen] = useState(false);
    const [editingPos, setEditingPos] = useState(null);

    const [catModalOpen, setCatModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState(null);

    // Form: Department
    const deptForm = useForm({
        name: '',
        code: '',
        description: '',
        is_active: true,
    });

    // Form: Position
    const posForm = useForm({
        department_id: departments[0]?.id || '',
        name: '',
        description: '',
        base_salary: '',
        is_active: true,
    });

    // Form: Category
    const catForm = useForm({
        name: '',
        color: '#1769E8',
        description: '',
        is_active: true,
    });

    // Form: Settings
    const settingsForm = useForm({
        company_name: settings.company_name || '',
        company_tagline: settings.company_tagline || '',
        company_email: settings.company_email || '',
        company_phone: settings.company_phone || '',
        company_address: settings.company_address || '',
        currency_code: settings.currency_code || 'IDR',
        currency_symbol: settings.currency_symbol || 'Rp',
        timezone: settings.timezone || 'Asia/Jakarta',
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    // Handlers for Department
    const openAddDept = () => {
        setEditingDept(null);
        deptForm.reset();
        deptForm.setData({ name: '', code: '', description: '', is_active: true });
        setDeptModalOpen(true);
    };

    const openEditDept = (dept) => {
        setEditingDept(dept);
        deptForm.setData({
            name: dept.name,
            code: dept.code,
            description: dept.description || '',
            is_active: Boolean(dept.is_active),
        });
        setDeptModalOpen(true);
    };

    const handleDeptSubmit = (e) => {
        e.preventDefault();
        if (editingDept) {
            deptForm.put(`/gm/master-data/departments/${editingDept.id}`, {
                onSuccess: () => setDeptModalOpen(false),
            });
        } else {
            deptForm.post('/gm/master-data/departments', {
                onSuccess: () => setDeptModalOpen(false),
            });
        }
    };

    // Handlers for Position
    const openAddPos = () => {
        setEditingPos(null);
        posForm.reset();
        posForm.setData({
            department_id: departments[0]?.id || '',
            name: '',
            description: '',
            base_salary: '',
            is_active: true,
        });
        setPosModalOpen(true);
    };

    const openEditPos = (pos) => {
        setEditingPos(pos);
        posForm.setData({
            department_id: pos.department_id,
            name: pos.name,
            description: pos.description || '',
            base_salary: pos.base_salary,
            is_active: Boolean(pos.is_active),
        });
        setPosModalOpen(true);
    };

    const handlePosSubmit = (e) => {
        e.preventDefault();
        if (editingPos) {
            posForm.put(`/gm/master-data/positions/${editingPos.id}`, {
                onSuccess: () => setPosModalOpen(false),
            });
        } else {
            posForm.post('/gm/master-data/positions', {
                onSuccess: () => setPosModalOpen(false),
            });
        }
    };

    // Handlers for Category
    const openAddCat = () => {
        setEditingCat(null);
        catForm.reset();
        catForm.setData({ name: '', color: '#1769E8', description: '', is_active: true });
        setCatModalOpen(true);
    };

    const openEditCat = (cat) => {
        setEditingCat(cat);
        catForm.setData({
            name: cat.name,
            color: cat.color,
            description: cat.description || '',
            is_active: Boolean(cat.is_active),
        });
        setCatModalOpen(true);
    };

    const handleCatSubmit = (e) => {
        e.preventDefault();
        if (editingCat) {
            catForm.put(`/gm/master-data/categories/${editingCat.id}`, {
                onSuccess: () => setCatModalOpen(false),
            });
        } else {
            catForm.post('/gm/master-data/categories', {
                onSuccess: () => setCatModalOpen(false),
            });
        }
    };

    // Handlers for Settings
    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        settingsForm.put('/gm/master-data/settings');
    };

    return (
        <AppLayout
            title="Master Data & Konfigurasi"
            subtitle="Atur struktur departemen, hierarki jabatan, standar gaji pokok, kategori penugasan, dan profil perusahaan"
        >
            <Head title="Master Data - WorkTrack" />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
                <button
                    onClick={() => setActiveTab('DEPARTMENTS')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'DEPARTMENTS'
                            ? 'bg-[#1769E8] text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    <span>Divisi & Departemen ({departments.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('POSITIONS')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'POSITIONS'
                            ? 'bg-[#1769E8] text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
                    }`}
                >
                    <Briefcase className="w-4 h-4" />
                    <span>Jabatan & Gaji ({positions.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('CATEGORIES')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'CATEGORIES'
                            ? 'bg-[#1769E8] text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
                    }`}
                >
                    <Tag className="w-4 h-4" />
                    <span>Kategori Tugas ({categories.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('SETTINGS')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'SETTINGS'
                            ? 'bg-[#1769E8] text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
                    }`}
                >
                    <Settings className="w-4 h-4" />
                    <span>Pengaturan Perusahaan</span>
                </button>
            </div>

            {/* Tab 1: Departments */}
            {activeTab === 'DEPARTMENTS' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Daftar Divisi Perusahaan</h3>
                            <p className="text-xs text-slate-400">Departemen operasional beserta jumlah karyawan aktif</p>
                        </div>
                        <button
                            onClick={openAddDept}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769E8] hover:bg-[#1255be] text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Divisi</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {departments.map((dept) => (
                            <div
                                key={dept.id}
                                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-3 flex flex-col justify-between"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                                            {dept.code}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                                dept.is_active
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {dept.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-base">{dept.name}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                        {dept.description || 'Tidak ada deskripsi'}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{dept.employees_count || 0} Karyawan</span>
                                    </div>
                                    <button
                                        onClick={() => openEditDept(dept)}
                                        className="inline-flex items-center gap-1 text-[#1769E8] hover:underline font-medium"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab 2: Positions */}
            {activeTab === 'POSITIONS' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Jabatan & Standar Gaji</h3>
                            <p className="text-xs text-slate-400">Struktur posisi dan benchmark gaji pokok perusahaan</p>
                        </div>
                        <button
                            onClick={openAddPos}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769E8] hover:bg-[#1255be] text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Jabatan</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-[#142B49]/5 text-xs uppercase font-semibold text-[#142B49] border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-4">Nama Jabatan</th>
                                        <th className="px-5 py-4">Departemen</th>
                                        <th className="px-5 py-4 text-right">Gaji Pokok Acuan</th>
                                        <th className="px-5 py-4 text-center">Jumlah Pegawai</th>
                                        <th className="px-5 py-4 text-center">Status</th>
                                        <th className="px-5 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {positions.map((pos) => (
                                        <tr key={pos.id} className="hover:bg-slate-50/70">
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-slate-800">{pos.name}</p>
                                                <p className="text-xs text-slate-400">{pos.description || '-'}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                                                    {pos.department?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right font-mono font-bold text-slate-800 text-xs sm:text-sm">
                                                {formatCurrency(pos.base_salary)}
                                            </td>
                                            <td className="px-5 py-4 text-center text-xs">
                                                {pos.employees_count || 0} orang
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                                                        pos.is_active
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-400'
                                                    }`}
                                                >
                                                    {pos.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => openEditPos(pos)}
                                                    className="p-1.5 text-slate-400 hover:text-[#1769E8] hover:bg-[#1769E8]/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 3: Task Categories */}
            {activeTab === 'CATEGORIES' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Kategori Tugas & Delegasi</h3>
                            <p className="text-xs text-slate-400">Pengelompokan jenis deliverable operasional</p>
                        </div>
                        <button
                            onClick={openAddCat}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769E8] hover:bg-[#1255be] text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Kategori</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] space-y-3 flex flex-col justify-between"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3.5 h-3.5 rounded-full"
                                                style={{ backgroundColor: cat.color || '#1769E8' }}
                                            />
                                            <span className="font-bold text-slate-800 text-sm">{cat.name}</span>
                                        </div>
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                                cat.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                            }`}
                                        >
                                            {cat.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                        {cat.description || 'Tidak ada deskripsi'}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-slate-400">{cat.tasks_count || 0} Tugas terkait</span>
                                    <button
                                        onClick={() => openEditCat(cat)}
                                        className="text-[#1769E8] hover:underline font-medium inline-flex items-center gap-1"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab 4: Settings */}
            {activeTab === 'SETTINGS' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] max-w-3xl">
                    <form onSubmit={handleSettingsSubmit} className="space-y-5">
                        <div>
                            <h3 className="text-base font-bold text-slate-800 mb-1">Pengaturan Instansi & Perusahaan</h3>
                            <p className="text-xs text-slate-400">
                                Informasi ini ditampilkan pada kop slip gaji resmi, laporan, dan header sistem.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                    Nama Perusahaan *
                                </label>
                                <input
                                    type="text"
                                    value={settingsForm.data.company_name}
                                    onChange={(e) => settingsForm.setData('company_name', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                    Tagline / Slogan
                                </label>
                                <input
                                    type="text"
                                    value={settingsForm.data.company_tagline}
                                    onChange={(e) => settingsForm.setData('company_tagline', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                    Email Resmi Perusahaan *
                                </label>
                                <input
                                    type="email"
                                    value={settingsForm.data.company_email}
                                    onChange={(e) => settingsForm.setData('company_email', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                    Nomor Telepon Kantor
                                </label>
                                <input
                                    type="text"
                                    value={settingsForm.data.company_phone}
                                    onChange={(e) => settingsForm.setData('company_phone', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Alamat Kantor Lengkap
                            </label>
                            <textarea
                                rows={3}
                                value={settingsForm.data.company_address}
                                onChange={(e) => settingsForm.setData('company_address', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                    Mata Uang *
                                </label>
                                <input
                                    type="text"
                                    value={settingsForm.data.currency_code}
                                    onChange={(e) => settingsForm.setData('currency_code', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                    Simbol *
                                </label>
                                <input
                                    type="text"
                                    value={settingsForm.data.currency_symbol}
                                    onChange={(e) => settingsForm.setData('currency_symbol', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                    Zona Waktu *
                                </label>
                                <input
                                    type="text"
                                    value={settingsForm.data.timezone}
                                    onChange={(e) => settingsForm.setData('timezone', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={settingsForm.processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1769E8] hover:bg-[#1255be] text-white rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-60"
                            >
                                <Save className="w-4 h-4" />
                                <span>{settingsForm.processing ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal: Department */}
            <Modal
                isOpen={deptModalOpen}
                onClose={() => setDeptModalOpen(false)}
                title={editingDept ? 'Edit Divisi' : 'Tambah Divisi Baru'}
                maxWidth="md"
            >
                <form onSubmit={handleDeptSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Kode Divisi *
                        </label>
                        <input
                            type="text"
                            value={deptForm.data.code}
                            onChange={(e) => deptForm.setData('code', e.target.value.toUpperCase())}
                            placeholder="Contoh: ENG, MKT, HRD"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            required
                        />
                        {deptForm.errors.code && <p className="text-xs text-rose-500 mt-1">{deptForm.errors.code}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Nama Divisi *
                        </label>
                        <input
                            type="text"
                            value={deptForm.data.name}
                            onChange={(e) => deptForm.setData('name', e.target.value)}
                            placeholder="Contoh: Engineering & Tech"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            required
                        />
                        {deptForm.errors.name && <p className="text-xs text-rose-500 mt-1">{deptForm.errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            rows={3}
                            value={deptForm.data.description}
                            onChange={(e) => deptForm.setData('description', e.target.value)}
                            placeholder="Cakupan kerja divisi..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                        />
                    </div>

                    {editingDept && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="dept_active"
                                checked={deptForm.data.is_active}
                                onChange={(e) => deptForm.setData('is_active', e.target.checked)}
                                className="w-4 h-4 text-[#1769E8] rounded focus:ring-[#1769E8]"
                            />
                            <label htmlFor="dept_active" className="text-sm font-medium text-slate-700">
                                Divisi Aktif
                            </label>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setDeptModalOpen(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={deptForm.processing}
                            className="px-5 py-2 text-sm font-medium text-white bg-[#1769E8] hover:bg-[#1255be] rounded-xl transition-all shadow-md disabled:opacity-60"
                        >
                            {deptForm.processing ? 'Menyimpan...' : 'Simpan Divisi'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Position */}
            <Modal
                isOpen={posModalOpen}
                onClose={() => setPosModalOpen(false)}
                title={editingPos ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}
                maxWidth="md"
            >
                <form onSubmit={handlePosSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Departemen *
                        </label>
                        <select
                            value={posForm.data.department_id}
                            onChange={(e) => posForm.setData('department_id', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            required
                        >
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name} ({d.code})
                                </option>
                            ))}
                        </select>
                        {posForm.errors.department_id && (
                            <p className="text-xs text-rose-500 mt-1">{posForm.errors.department_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Nama Jabatan *
                        </label>
                        <input
                            type="text"
                            value={posForm.data.name}
                            onChange={(e) => posForm.setData('name', e.target.value)}
                            placeholder="Contoh: Senior Backend Engineer"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            required
                        />
                        {posForm.errors.name && <p className="text-xs text-rose-500 mt-1">{posForm.errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Gaji Pokok Acuan (Rp) *
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="50000"
                            value={posForm.data.base_salary}
                            onChange={(e) => posForm.setData('base_salary', e.target.value)}
                            placeholder="Contoh: 8500000"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            required
                        />
                        {posForm.errors.base_salary && (
                            <p className="text-xs text-rose-500 mt-1">{posForm.errors.base_salary}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Deskripsi Jabatan
                        </label>
                        <textarea
                            rows={3}
                            value={posForm.data.description}
                            onChange={(e) => posForm.setData('description', e.target.value)}
                            placeholder="Tanggung jawab utama..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                        />
                    </div>

                    {editingPos && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="pos_active"
                                checked={posForm.data.is_active}
                                onChange={(e) => posForm.setData('is_active', e.target.checked)}
                                className="w-4 h-4 text-[#1769E8] rounded focus:ring-[#1769E8]"
                            />
                            <label htmlFor="pos_active" className="text-sm font-medium text-slate-700">
                                Jabatan Aktif
                            </label>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setPosModalOpen(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={posForm.processing}
                            className="px-5 py-2 text-sm font-medium text-white bg-[#1769E8] hover:bg-[#1255be] rounded-xl transition-all shadow-md disabled:opacity-60"
                        >
                            {posForm.processing ? 'Menyimpan...' : 'Simpan Jabatan'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Category */}
            <Modal
                isOpen={catModalOpen}
                onClose={() => setCatModalOpen(false)}
                title={editingCat ? 'Edit Kategori' : 'Tambah Kategori Tugas'}
                maxWidth="md"
            >
                <form onSubmit={handleCatSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Nama Kategori *
                        </label>
                        <input
                            type="text"
                            value={catForm.data.name}
                            onChange={(e) => catForm.setData('name', e.target.value)}
                            placeholder="Contoh: Operasional, IT Development"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            required
                        />
                        {catForm.errors.name && <p className="text-xs text-rose-500 mt-1">{catForm.errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Warna Label *
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={catForm.data.color}
                                onChange={(e) => catForm.setData('color', e.target.value)}
                                className="w-12 h-10 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer"
                            />
                            <input
                                type="text"
                                value={catForm.data.color}
                                onChange={(e) => catForm.setData('color', e.target.value)}
                                className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            rows={3}
                            value={catForm.data.description}
                            onChange={(e) => catForm.setData('description', e.target.value)}
                            placeholder="Tujuan kategori tugas..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1769E8]"
                        />
                    </div>

                    {editingCat && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="cat_active"
                                checked={catForm.data.is_active}
                                onChange={(e) => catForm.setData('is_active', e.target.checked)}
                                className="w-4 h-4 text-[#1769E8] rounded focus:ring-[#1769E8]"
                            />
                            <label htmlFor="cat_active" className="text-sm font-medium text-slate-700">
                                Kategori Aktif
                            </label>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setCatModalOpen(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={catForm.processing}
                            className="px-5 py-2 text-sm font-medium text-white bg-[#1769E8] hover:bg-[#1255be] rounded-xl transition-all shadow-md disabled:opacity-60"
                        >
                            {catForm.processing ? 'Menyimpan...' : 'Simpan Kategori'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
