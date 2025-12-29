'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, BarChart3, Plus, Settings } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface NavigationProps {
    onAddClick?: () => void;
}

export function Navigation({ onAddClick }: NavigationProps) {
    const pathname = usePathname();
    const { t } = useTranslation();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 lg:left-64 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] safe-area-pb z-30">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
                <div className="flex items-center justify-around">
                    <Link
                        href="/dashboard"
                        className={`flex flex-col items-center gap-1 px-3 lg:px-6 py-2 rounded-lg transition-colors ${isActive('/dashboard')
                            ? 'text-[var(--neon-blue)] bg-[var(--bg-hover)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <LayoutDashboard size={24} />
                        <span className="text-xs font-medium hidden sm:block">{t.nav.dashboard}</span>
                    </Link>

                    <Link
                        href="/"
                        className={`flex flex-col items-center gap-1 px-3 lg:px-6 py-2 rounded-lg transition-colors ${isActive('/')
                            ? 'text-[var(--neon-blue)] bg-[var(--bg-hover)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <Wallet size={24} />
                        <span className="text-xs font-medium hidden sm:block">{t.nav.transactions}</span>
                    </Link>

                    {/* 新增按鈕 - 在所有頁面顯示 */}
                    {onAddClick && (
                        <button
                            onClick={onAddClick}
                            className="flex items-center justify-center w-14 h-14 bg-[var(--neon-blue)] text-white rounded-full shadow-lg hover:scale-110 transition-all glow-blue"
                        >
                            <Plus size={28} strokeWidth={2.5} />
                        </button>
                    )}

                    <Link
                        href="/analytics"
                        className={`flex flex-col items-center gap-1 px-3 lg:px-6 py-2 rounded-lg transition-colors ${isActive('/analytics')
                            ? 'text-[var(--neon-blue)] bg-[var(--bg-hover)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <BarChart3 size={24} />
                        <span className="text-xs font-medium hidden sm:block">{t.nav.analytics}</span>
                    </Link>

                    <Link
                        href="/settings"
                        className={`flex flex-col items-center gap-1 px-3 lg:px-6 py-2 rounded-lg transition-colors ${isActive('/settings')
                            ? 'text-[var(--neon-blue)] bg-[var(--bg-hover)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <Settings size={24} />
                        <span className="text-xs font-medium hidden sm:block">{t.nav.settings}</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
