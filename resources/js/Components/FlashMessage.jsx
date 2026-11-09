import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setCurrentMessage({ type: 'success', text: flash.success });
            setVisible(true);
        } else if (flash?.error) {
            setCurrentMessage({ type: 'error', text: flash.error });
            setVisible(true);
        } else if (flash?.warning) {
            setCurrentMessage({ type: 'warning', text: flash.warning });
            setVisible(true);
        } else if (flash?.info) {
            setCurrentMessage({ type: 'info', text: flash.info });
            setVisible(true);
        }

        const timer = setTimeout(() => {
            setVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [flash]);

    if (!visible || !currentMessage) return null;

    const config = {
        success: {
            bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
            icon: CheckCircle2,
            iconColor: 'text-emerald-500',
        },
        error: {
            bg: 'bg-rose-50 border-rose-200 text-rose-800',
            icon: AlertCircle,
            iconColor: 'text-rose-500',
        },
        warning: {
            bg: 'bg-amber-50 border-amber-200 text-amber-800',
            icon: AlertTriangle,
            iconColor: 'text-amber-500',
        },
        info: {
            bg: 'bg-blue-50 border-blue-200 text-blue-800',
            icon: Info,
            iconColor: 'text-blue-500',
        },
    }[currentMessage.type];

    const Icon = config.icon;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto animate-in slide-in-from-top-3 fade-in duration-300">
            <div
                className={`flex items-start p-4 rounded-xl border shadow-lg ${config.bg}`}
            >
                <Icon className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${config.iconColor}`} />
                <div className="flex-1 text-sm font-medium pr-2">
                    {currentMessage.text}
                </div>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="p-1 -mr-1 -mt-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
