import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import Modal from '../../../Components/Modal';
import Badge from '../../../Components/Badge';
import Pagination from '../../../Components/Pagination';
import {
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Power,
    Trash2,
    Users,
    Phone,
    Mail,
    Building2,
    Briefcase,
    DollarSign,
} from 'lucide-react';

export default function EmployeesIndex({ employees, departments, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [departmentId, setDepartmentId] = useState(filters.department_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        department_id: '',
        position_id: '',
        gender: 'male',
        address: '',
        join_date: new Date().toISOString().split('T')[0],
        employment_status: 'permanent',
        basic_salary: '',
        bank_name: 'Bank Central Asia (BCA)',
        bank_account_number: '',
        bank_account_holder: '',
        status: 'active',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/gm/employees',
            { search, department_id: departmentId, status },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        reset();
        setEditingEmployee(null);
        if (departments.length > 0) {
            setData('department_id', departments[0].id);
            if (departments[0].positions?.length > 0) {
                setData('position_id', departments[0].positions[0].id);
                setData('basic_salary', departments[0].positions[0].base_salary || '');
            }
        }
        setIsCreateModalOpen(true);
    };

    const openEditModal = (emp) => {
        setEditingEmployee(emp);
        setData({
            name: emp.user.name,
            email: emp.user.email,
            password: '',
            phone: emp.phone || emp.user.phone || '',
            department_id: emp.department_id,
            position_id: emp.position_id,
            gender: emp.gender || 'male',
            address: emp.address || '',
            join_date: emp.join_date ? emp.join_date.split('T')[0] : '',
            employment_status: emp.employment_status || 'permanent',
            basic_salary: emp.basic_salary,
            bank_name: emp.bank_name || '',
            bank_account_number: emp.bank_account_number || '',
            bank_account_holder: emp.bank_account_holder || emp.user.name,
            status: emp.status,
        });
        setIsCreateModalOpen(true);
    };

    const handleDepartmentChange = (deptId) => {
        setData('department_id', deptId);
        const selectedDept = departments.find((d) => d.id === parseInt(deptId));
        if (selectedDept && selectedDept.positions?.length > 0) {
            setData('position_id', selectedDept.positions[0].id);
            setData('basic_salary', selectedDept.positions[0].base_salary || '');
        } else {
            setData('position_id', '');
        }
    };

    const handlePositionChange = (posId) => {
        setData('position_id', posId);
        const currentDept = departments.find((d) => d.id === parseInt(data.department_id));
        const pos = currentDept?.positions?.find((p) => p.id === parseInt(posId));
        if (pos && pos.base_salary) {
            setData('basic_salary', pos.base_salary);
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (editingEmployee) {
            put(`/gm/employees/${editingEmployee.id}`, {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/gm/employees', {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                },
            });
        }
    };

    const toggleStatus = (emp) => {
        if (confirm(`Ubah status karyawan ${emp.user.name} menjadi ${emp.status === 'active' ? 'Nonaktif' : 'Aktif'}?`)) {
            router.patch(`/gm/employees/${emp.id}/toggle-status`);
        }
    };

    const deleteEmployee = (emp) => {
        if (confirm(`Hapus (soft delete) karyawan ${emp.user.name}? Tindakan ini akan menonaktifkan akun.`)) {
            router.delete(`/gm/employees/${emp.id}`);
        }
    };

    const currentPositions = departments.find((d) => d.id === parseInt(data.department_id))?.positions || [];

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <AppLayout
            title="Manajemen Karyawan"
            subtitle="Kelola seluruh data karyawan, penugasan divisi, dan profil kepegawaian"
        >
            <Head title="Manajemen Karyawan - WorkTrack" />

            {/* Top Action Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Search and Filters */}
                    <form onSubmit={handleFilter} className="flex-1 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, email, atau ID..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                            />
                        </div>

                        <select
                            value={departmentId}
                            onChange={(e) => {
                                setDepartmentId(e.target.value);
                                router.get(
                                    '/gm/employees',
                                    { search, department_id: e.target.value, status },
                                    { preserveState: true }
                                );
                            }}
                            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white"
                        >
                            <option value="">Semua Divisi</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                router.get(
                                    '/gm/employees',
                                    { search, department_id: departmentId, status: e.target.value },
                                    { preserveState: true }
                                );
                            }}
                            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white"
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
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
                            href="/gm/export/employees"
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
                            <span>Tambah Karyawan</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Karyawan</th>
                                <th className="px-6 py-4">Divisi & Jabatan</th>
                                <th className="px-6 py-4">Kontak</th>
                                <th className="px-6 py-4">Beban Tugas</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {employees.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        Tidak ada data karyawan yang cocok dengan kriteria pencarian.
                                    </td>
                                </tr>
                            ) : (
                                employees.data.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#1769E8]/10 text-[#1769E8] font-bold flex items-center justify-center shrink-0">
                                                    {emp.user.avatar ? (
                                                        <img
                                                            src={`/storage/${emp.user.avatar}`}
                                                            alt={emp.user.name}
                                                            className="w-full h-full object-cover rounded-xl"
                                                        />
                                                    ) : (
                                                        emp.user.name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/gm/employees/${emp.id}`}
                                                        className="font-bold text-[#142B49] hover:text-[#1769E8] transition-colors"
                                                    >
                                                        {emp.user.name}
                                                    </Link>
                                                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                                                        {emp.employee_code}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-800">
                                                {emp.position ? emp.position.name : '-'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {emp.department ? emp.department.name : '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-slate-700">{emp.user.email}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{emp.phone || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-xs">
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded">
                                                    {emp.active_tasks || 0} aktif
                                                </span>
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded">
                                                    {emp.completed_tasks || 0} selesai
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge status={emp.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <Link
                                                    href={`/gm/employees/${emp.id}`}
                                                    className="p-2 text-slate-400 hover:text-[#1769E8] hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(emp)}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Edit Data"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(emp)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Ubah Status"
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteEmployee(emp)}
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
                <Pagination links={employees.links} from={employees.from} to={employees.to} total={employees.total} />
            </div>

            {/* Mobile Card List View (Visible on smartphone 320px - 767px) */}
            <div className="md:hidden space-y-3">
                {employees.data.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100 text-xs">
                        Tidak ada data karyawan ditemukan.
                    </div>
                ) : (
                    employees.data.map((emp) => (
                        <div
                            key={emp.id}
                            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(20,43,73,0.03)] space-y-3"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1769E8] font-bold flex items-center justify-center shrink-0">
                                        {emp.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <Link
                                            href={`/gm/employees/${emp.id}`}
                                            className="font-bold text-sm text-[#142B49] block leading-tight"
                                        >
                                            {emp.user.name}
                                        </Link>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                                            {emp.employee_code}
                                        </p>
                                    </div>
                                </div>
                                <Badge status={emp.status} size="xs" />
                            </div>

                            <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 space-y-1">
                                <p className="font-semibold text-slate-800 truncate">
                                    {emp.position?.name || '-'} • {emp.department?.name || '-'}
                                </p>
                                <p className="truncate text-slate-500">{emp.user.email}</p>
                                <div className="flex items-center justify-between pt-1 text-[11px]">
                                    <span>Tugas Aktif: <strong>{emp.active_tasks || 0}</strong></span>
                                    <span>Selesai: <strong>{emp.completed_tasks || 0}</strong></span>
                                    <span>Gaji: <strong>{formatCurrency(emp.basic_salary)}</strong></span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100">
                                <Link
                                    href={`/gm/employees/${emp.id}`}
                                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors min-h-[36px] flex items-center"
                                >
                                    Detail
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => openEditModal(emp)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors min-h-[36px]"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleStatus(emp)}
                                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors min-h-[36px]"
                                >
                                    {emp.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
                <Pagination links={employees.links} from={employees.from} to={employees.to} total={employees.total} />
            </div>

            {/* Create & Edit Employee Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                subtitle="Masukkan rincian profil kepegawaian, akun login, dan gaji pokok"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={submitForm} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Nama Lengkap *
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                            />
                            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Alamat Email *
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                            />
                            {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    {!editingEmployee && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Kata Sandi Awal (Opsional)
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Kosongkan untuk default 'password'"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Divisi *
                            </label>
                            <select
                                value={data.department_id}
                                onChange={(e) => handleDepartmentChange(e.target.value)}
                                required
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                            >
                                <option value="">Pilih Divisi</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} ({d.code})
                                    </option>
                                ))}
                            </select>
                            {errors.department_id && <p className="text-xs text-rose-600 mt-1">{errors.department_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Jabatan *
                            </label>
                            <select
                                value={data.position_id}
                                onChange={(e) => handlePositionChange(e.target.value)}
                                required
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E8]"
                            >
                                <option value="">Pilih Jabatan</option>
                                {currentPositions.map((pos) => (
                                    <option key={pos.id} value={pos.id}>
                                        {pos.name}
                                    </option>
                                ))}
                            </select>
                            {errors.position_id && <p className="text-xs text-rose-600 mt-1">{errors.position_id}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Nomor Telepon
                            </label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="0812xxxx"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Status Kerja *
                            </label>
                            <select
                                value={data.employment_status}
                                onChange={(e) => setData('employment_status', e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                            >
                                <option value="permanent">Tetap (Permanent)</option>
                                <option value="contract">Kontrak</option>
                                <option value="probation">Probation</option>
                                <option value="internship">Magang</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Gaji Pokok (Rp) *
                            </label>
                            <input
                                type="number"
                                value={data.basic_salary}
                                onChange={(e) => setData('basic_salary', e.target.value)}
                                required
                                min="0"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white font-mono"
                            />
                            {errors.basic_salary && <p className="text-xs text-rose-600 mt-1">{errors.basic_salary}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Tanggal Bergabung *
                            </label>
                            <input
                                type="date"
                                value={data.join_date}
                                onChange={(e) => setData('join_date', e.target.value)}
                                required
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Jenis Kelamin
                            </label>
                            <select
                                value={data.gender}
                                onChange={(e) => setData('gender', e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                            >
                                <option value="male">Laki-Laki</option>
                                <option value="female">Perempuan</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Informasi Rekening Pembayaran Gaji
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Bank</label>
                                <input
                                    type="text"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                    placeholder="Contoh: BCA / Mandiri"
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">No. Rekening</label>
                                <input
                                    type="text"
                                    value={data.bank_account_number}
                                    onChange={(e) => setData('bank_account_number', e.target.value)}
                                    placeholder="Nomor rekening"
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Pemilik</label>
                                <input
                                    type="text"
                                    value={data.bank_account_holder}
                                    onChange={(e) => setData('bank_account_holder', e.target.value)}
                                    placeholder="Atas nama"
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
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
                            {processing ? 'Menyimpan...' : editingEmployee ? 'Perbarui Data' : 'Simpan Karyawan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
