import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, UserCheck, Loader2 } from 'lucide-react';

export default function EmployeeSearchSelect({
    selectedIds = [],
    onChange,
    label = 'Pilih Karyawan Penerima Tugas',
    placeholder = 'Ketik nama atau kode karyawan...',
    error,
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const containerRef = useRef(null);

    // Initial fetch of active employees for quick selection
    useEffect(() => {
        fetchEmployees('');
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEmployees(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchEmployees = async (searchQuery) => {
        setLoading(true);
        try {
            const res = await window.axios.get(`/gm/tasks/search-employees?q=${encodeURIComponent(searchQuery)}`);
            setResults(res.data);
            
            // Sync selected employee objects if not yet cached
            if (selectedIds.length > 0) {
                const found = res.data.filter((e) => selectedIds.includes(e.id));
                setSelectedEmployees((prev) => {
                    const map = new Map();
                    [...prev, ...found].forEach((item) => map.set(item.id, item));
                    return selectedIds.map((id) => map.get(id)).filter(Boolean);
                });
            }
        } catch (err) {
            console.error('Gagal mengambil data karyawan:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleEmployee = (emp) => {
        let newSelected;
        if (selectedIds.includes(emp.id)) {
            newSelected = selectedIds.filter((id) => id !== emp.id);
            setSelectedEmployees((prev) => prev.filter((e) => e.id !== emp.id));
        } else {
            newSelected = [...selectedIds, emp.id];
            setSelectedEmployees((prev) => [...prev, emp]);
        }
        onChange(newSelected);
    };

    const removeEmployee = (id) => {
        const newSelected = selectedIds.filter((empId) => empId !== id);
        setSelectedEmployees((prev) => prev.filter((e) => e.id !== id));
        onChange(newSelected);
    };

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label className="block text-sm font-semibold text-slate-700">
                {label} <span className="text-rose-500">*</span>
            </label>

            {/* Selected Chips */}
            {selectedEmployees.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    {selectedEmployees.map((emp) => (
                        <div
                            key={emp.id}
                            className="inline-flex items-center gap-2 bg-white border border-blue-200 text-blue-900 rounded-lg px-2.5 py-1 text-xs shadow-xs"
                        >
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-[#1769E8] font-bold flex items-center justify-center text-[10px]">
                                {emp.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold">{emp.name}</span>
                                <span className="text-[10px] text-slate-500">{emp.department} • {emp.code}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeEmployee(emp.id)}
                                className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors ml-1"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Search Box */}
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1769E8] focus:border-transparent text-base sm:text-sm"
                />
                {loading && (
                    <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />
                )}
            </div>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {results.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">
                            {loading ? 'Mencari data...' : 'Tidak ada karyawan yang cocok.'}
                        </div>
                    ) : (
                        results.map((emp) => {
                            const isSelected = selectedIds.includes(emp.id);
                            return (
                                <button
                                    type="button"
                                    key={emp.id}
                                    onClick={() => toggleEmployee(emp)}
                                    className={`w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                                        isSelected ? 'bg-blue-50/60' : ''
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-[#142B49] font-bold flex items-center justify-center text-xs shrink-0">
                                            {emp.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {emp.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {emp.position} • {emp.department} • <span className="font-mono">{emp.code}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {isSelected ? (
                                            <span className="w-6 h-6 rounded-full bg-[#1769E8] text-white flex items-center justify-center">
                                                <Check className="w-3.5 h-3.5" />
                                            </span>
                                        ) : (
                                            <span className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-transparent hover:border-slate-400">
                                                <Check className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            )}

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        </div>
    );
}
