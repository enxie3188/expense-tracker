'use client';

import { Transaction, Category } from '@/types';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatAmount } from '@/lib/calculations';
import { formatDateDisplay, calculateDailyNet } from '@/lib/dateUtils';
import * as LucideIcons from 'lucide-react';

interface DateGroupProps {
    date: string;
    transactions: Transaction[];
    categories: Category[];
    onDelete: (id: string) => void;
}

export function DateGroup({ date, transactions, categories, onDelete }: DateGroupProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const dailyNet = calculateDailyNet(transactions);
    const displayDate = formatDateDisplay(date);

    const getCategoryById = (categoryId: string) => {
        return categories.find((cat) => cat.id === categoryId);
    };

    const CategoryIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
        const Icon = (LucideIcons as any)[iconName];
        if (!Icon) return null;
        return <Icon size={16} className={className} />;
    };

    return (
        <div className="mb-2">
            {/* 日期標題行 */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? (
                        <ChevronDown size={18} className="text-gray-600" />
                    ) : (
                        <ChevronRight size={18} className="text-gray-600" />
                    )}
                    <span className="text-sm font-medium text-gray-600">{displayDate}</span>
                </div>

                <span className={`text-sm font-semibold ${dailyNet >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {dailyNet >= 0 ? '+' : ''}{formatAmount(dailyNet).replace('NT$', '$')}
                </span>
            </button>

            {/* 展開的交易列表 */}
            {isExpanded && (
                <div className="bg-white">
                    {transactions.map((transaction) => {
                        const category = getCategoryById(transaction.category);
                        return (
                            <div
                                key={transaction.id}
                                className="group flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className={`w-8 h-8 rounded-lg bg-${category?.color || 'gray'}-500/10 flex items-center justify-center`}>
                                        {category && (
                                            <CategoryIcon
                                                iconName={category.icon}
                                                className={`text-${category.color}-500`}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">
                                            {transaction.note || category?.name || '無備註'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {category?.name}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-semibold tabular-nums ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.type === 'income' ? '+' : '-'}
                                        {formatAmount(transaction.amount).replace('NT$', '$')}
                                    </span>

                                    <button
                                        onClick={() => onDelete(transaction.id)}
                                        className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition-all"
                                    >
                                        刪除
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
