'use client';

import { ReactNode } from 'react';

interface MetricCardProps {
    title: string;
    value: number | string;
    format?: 'number' | 'percentage' | 'currency' | 'ratio';
    isNegative?: boolean;
    icon?: ReactNode;
    subtitle?: string;
}

export function MetricCard({ title, value, format = 'number', isNegative = false, icon, subtitle }: MetricCardProps) {
    const formatValue = (val: number | string): string => {
        if (typeof val === 'string') return val;

        switch (format) {
            case 'percentage':
                return `${val.toFixed(2)}%`;
            case 'currency':
                return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            case 'ratio':
                return val.toFixed(2);
            default:
                return val.toLocaleString();
        }
    };

    const getValueColor = () => {
        if (format === 'currency' || format === 'number') {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            if (numValue > 0) return 'text-[var(--neon-green)]';
            if (numValue < 0) return 'text-[var(--neon-pink)]';
        }

        if (isNegative) {
            return 'text-[var(--neon-pink)]';
        }

        return 'text-[var(--text-primary)]';
    };

    return (
        <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-colors aspect-square flex flex-col justify-center items-center text-center">
            <div className="text-[10px] text-[var(--text-secondary)] font-medium mb-2">{title}</div>

            <div className={`text-xl font-bold mb-1 ${getValueColor()}`}>
                {formatValue(value)}
            </div>

            {subtitle && (
                <div className="text-[9px] text-[var(--text-muted)]">{subtitle}</div>
            )}

            {icon && <div className="text-[var(--text-muted)] mt-1 opacity-50">{icon}</div>}
        </div>
    );
}
