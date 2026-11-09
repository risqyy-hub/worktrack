import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links = [], from, to, total }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white border-t border-slate-100 rounded-b-2xl">
            <div className="text-xs sm:text-sm text-slate-500 order-2 sm:order-1">
                {total !== undefined && (
                    <span>
                        Menampilkan <span className="font-semibold text-slate-700">{from || 0}</span> sampai{' '}
                        <span className="font-semibold text-slate-700">{to || 0}</span> dari{' '}
                        <span className="font-semibold text-slate-700">{total}</span> data
                    </span>
                )}
            </div>

            <div className="flex items-center space-x-1 order-1 sm:order-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                {links.map((link, key) => {
                    if (link.url === null) {
                        return (
                            <span
                                key={key}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className="px-3 py-1.5 text-xs text-slate-400 border border-slate-100 rounded-lg select-none min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
                            />
                        );
                    }

                    return (
                        <Link
                            key={key}
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0 transition-colors ${
                                link.active
                                    ? 'bg-[#1769E8] text-white border-[#1769E8]'
                                    : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
