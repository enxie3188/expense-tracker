'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Plus } from 'lucide-react';

interface NavigationProps {
    onAddClick?: () => void;
}

export function Navigation({ onAddClick }: NavigationProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;
    const isHomePage = pathname === '/';

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb shadow-lg">
            <div className="max-w-2xl mx-auto px-6 py-3">
                <div className="flex items-center justify-around">
                    <Link
                        href="/"
                        className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${isActive('/')
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Home size={24} />
                        <span className="text-xs font-medium">首頁</span>
                    </Link>

                    {/* 新增按鈕 - 在所有頁面顯示 */}
                    {onAddClick && (
                        <button
                            onClick={onAddClick}
                            className="flex items-center justify-center w-14 h-14 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:scale-110 transition-all"
                        >
                            <Plus size={28} strokeWidth={2.5} />
                        </button>
                    )}

                    <Link
                        href="/analytics"
                        className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${isActive('/analytics')
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <BarChart3 size={24} />
                        <span className="text-xs font-medium">分析</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
