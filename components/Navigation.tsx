'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, BarChart3, Plus, Settings } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface NavigationProps {
    onAddClick?: () => void;
}

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' as const },
    { path: '/', icon: Wallet, labelKey: 'transactions' as const },
    { path: '/analytics', icon: BarChart3, labelKey: 'analytics' as const },
    { path: '/settings', icon: Settings, labelKey: 'settings' as const },
];

export function Navigation({ onAddClick }: NavigationProps) {
    const pathname = usePathname();
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    const isActive = (path: string) => pathname === path;

    // Find active item index (excluding the + button in the middle)
    const getActiveIndex = () => {
        if (pathname === '/dashboard') return 0;
        if (pathname === '/') return 1;
        if (pathname === '/analytics') return 2;
        if (pathname === '/settings') return 3;
        return -1;
    };

    // Update indicator position when pathname changes
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const activeIndex = getActiveIndex();
        if (activeIndex === -1) return;

        // Get all nav items (excluding the + button)
        const items = container.querySelectorAll('[data-nav-item]');
        const activeItem = items[activeIndex] as HTMLElement;

        if (activeItem) {
            const containerRect = container.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();

            setIndicatorStyle({
                left: itemRect.left - containerRect.left + (itemRect.width - 40) / 2,
                width: 40,
            });
        }
    }, [pathname]);

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 lg:left-64 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] z-30 pb-6">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2">
                <div ref={containerRef} className="flex items-center justify-around relative">
                    {/* Sliding Indicator */}
                    <motion.div
                        className="absolute bottom-0 h-1 bg-[var(--neon-blue)] rounded-full"
                        initial={false}
                        animate={{
                            left: indicatorStyle.left,
                            width: indicatorStyle.width,
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            left: { type: 'spring', stiffness: 400, damping: 30 },
                            width: { type: 'spring', stiffness: 400, damping: 30 },
                            scale: { duration: 0.2 },
                        }}
                        style={{ boxShadow: '0 0 8px var(--neon-blue-glow)' }}
                    />

                    <Link
                        href="/dashboard"
                        data-nav-item
                        className={`flex flex-col items-center gap-1 px-3 lg:px-6 py-2 rounded-lg transition-colors ${isActive('/dashboard')
                            ? 'text-[var(--neon-blue)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <LayoutDashboard size={24} />
                        <span className="text-xs font-medium hidden sm:block">{t.nav.dashboard}</span>
                    </Link>

                    <Link
                        href="/"
                        data-nav-item
                        className={`flex flex-col items-center gap-1 px-3 lg:px-6 py-2 rounded-lg transition-colors ${isActive('/')
                            ? 'text-[var(--neon-blue)]'
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
                        data-nav-item
                        className={`flex flex-col items-center gap-1 px-3 lg:px-6 py-2 rounded-lg transition-colors ${isActive('/analytics')
                            ? 'text-[var(--neon-blue)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <BarChart3 size={24} />
                        <span className="text-xs font-medium hidden sm:block">{t.nav.analytics}</span>
                    </Link>

                    <Link
                        href="/settings"
                        data-nav-item
                        className={`flex flex-col items-center gap-1 px-3 lg:px-6 py-2 rounded-lg transition-colors ${isActive('/settings')
                            ? 'text-[var(--neon-blue)]'
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
