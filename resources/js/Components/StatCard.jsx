import React from 'react';

export default function StatCard({
    title,
    value,
    icon: Icon,
    iconBg = 'bg-blue-50 text-blue-600',
    subtitle,
    trend,
    trendType = 'up',
    onClick,
}) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(20,43,73,0.04)] transition-all duration-200 hover:shadow-md ${
                onClick ? 'cursor-pointer hover:border-slate-300' : ''
            }`}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">
                        {title}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#142B49] tracking-tight">
                        {value}
                    </h3>
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                )}
            </div>

            {(subtitle || trend) && (
                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                    {subtitle && <span>{subtitle}</span>}
                    {trend && (
                        <span
                            className={`font-semibold ${
                                trendType === 'up' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                        >
                            {trend}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
