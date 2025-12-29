'use client';

import { AlphaLogLogo } from "@/components/brand/AlphaLogLogo";
import { LayoutDashboard, History, PieChart, Settings, LogOut, User } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';

export const Sidebar = () => {
    const pathname = usePathname();
    const { t } = useTranslation();
    const { user, loading, signOut } = useAuth();

    const menuItems = [
        { href: '/dashboard', icon: <LayoutDashboard size={20} />, label: t.nav.dashboard || "Dashboard" },
        { href: '/', icon: <History size={20} />, label: t.nav.transactions || "交易記錄" },
        { href: '/analytics', icon: <PieChart size={20} />, label: t.nav.analytics || "績效分析" },
        { href: '/settings', icon: <Settings size={20} />, label: t.nav.settings || "設定" },
    ];

    return (
        <aside
            className="w-64 border-r backdrop-blur-xl hidden md:flex flex-col z-20 transition-all duration-300"
            style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
            }}
        >
            {/* 品牌區 */}
            <div className="p-8 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div style={{ color: 'var(--text-primary)' }}>
                        <AlphaLogLogo className="w-9 h-9" />
                    </div>
                    <span
                        className="text-2xl font-bold tracking-tight transition-colors duration-300"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        AlphaLog
                    </span>
                </div>
                <p
                    className="text-[10px] tracking-[0.2em] font-semibold uppercase opacity-80 pl-1"
                    style={{ color: 'var(--neon-blue)' }}
                >
                    Master Your Edge
                </p>
            </div>

            {/* 導覽選單 */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = item.href === '/'
                        ? pathname === '/'
                        : pathname?.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                            style={{
                                backgroundColor: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                                color: isActive ? 'var(--neon-blue)' : 'var(--text-secondary)',
                                border: isActive ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent',
                                boxShadow: isActive ? '0 0 15px rgba(6, 182, 212, 0.1)' : 'none',
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }
                            }}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* 用戶區域 */}
            <div className="p-4 space-y-3">
                {/* 用戶資訊 */}
                {!loading && user && (
                    <div
                        className="p-3 rounded-xl flex items-center gap-3"
                        style={{
                            backgroundColor: 'var(--bg-hover)',
                            border: '1px solid var(--border-subtle)',
                        }}
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--neon-blue)', color: 'white' }}
                        >
                            <User size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p
                                className="text-sm font-medium truncate"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {user.email?.split('@')[0]}
                            </p>
                            <p
                                className="text-xs truncate"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {user.email}
                            </p>
                        </div>
                    </div>
                )}

                {/* 登出按鈕 */}
                {!loading && user && (
                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                        style={{
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
                            e.currentTarget.style.color = '#F43F5E';
                            e.currentTarget.style.border = '1px solid rgba(244, 63, 94, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.border = '1px solid transparent';
                        }}
                    >
                        <LogOut size={20} />
                        <span className="font-medium">登出</span>
                    </button>
                )}

                {/* 未登入時顯示登入連結 */}
                {!loading && !user && (
                    <Link
                        href="/login"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                        style={{
                            backgroundColor: 'var(--neon-blue)',
                            color: 'white',
                        }}
                    >
                        <User size={20} />
                        <span className="font-medium">登入 / 註冊</span>
                    </Link>
                )}

                {/* 版本資訊 */}
                <div
                    className="p-3 rounded-xl backdrop-blur-sm transition-colors duration-300"
                    style={{
                        backgroundColor: 'var(--bg-hover)',
                        border: '1px solid var(--border-subtle)',
                    }}
                >
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>目前版本</p>
                    <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>v1.1.0-alpha</p>
                </div>
            </div>
        </aside>
    );
};
