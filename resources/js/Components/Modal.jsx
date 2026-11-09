import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    maxWidth = 'max-w-2xl',
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Dialog Card */}
            <div
                className={`relative w-full ${maxWidth} bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200`}
            >
                {/* Header */}
                <div className="px-5 py-4 sm:px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                    <div>
                        <h3 className="text-lg font-bold text-[#142B49] leading-snug">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Tutup"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body with scrolling */}
                <div className="px-5 py-5 sm:px-6 overflow-y-auto flex-1 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
