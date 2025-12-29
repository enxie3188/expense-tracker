'use client';

import { TradingTransaction } from '@/types/ledger';
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ProfitCalendarProps {
    transactions: TradingTransaction[];
    selectedMonth: Date;
    onMonthChange: (date: Date) => void;
}

interface DayData {
    date: number;
    pnl: number;
    tradeCount: number;
}

export function ProfitCalendar({ transactions, selectedMonth, onMonthChange }: ProfitCalendarProps) {
    const { t } = useTranslation();
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    // ... (keep logic same until constants)

    //計算每天的盈虧
    const dailyPnL = useMemo(() => {
        const pnlMap = new Map<number, DayData>();

        transactions.forEach(trade => {
            const tradeDate = new Date(trade.date);
            if (tradeDate.getFullYear() === year && tradeDate.getMonth() === month) {
                const day = tradeDate.getDate();
                const existing = pnlMap.get(day) || { date: day, pnl: 0, tradeCount: 0 };
                pnlMap.set(day, {
                    date: day,
                    pnl: existing.pnl + (trade.pnl || 0),
                    tradeCount: existing.tradeCount + 1,
                });
            }
        });

        return pnlMap;
    }, [transactions, year, month]);

    // 獲取當月日曆數據（按週分組）
    const calendarWeeks = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const weeks: Array<Array<DayData | null>> = [];
        let currentWeek: Array<DayData | null> = [];

        // 填充第一週的空白
        for (let i = 0; i < startDayOfWeek; i++) {
            currentWeek.push(null);
        }

        // 填充實際日期
        for (let day = 1; day <= daysInMonth; day++) {
            const data = dailyPnL.get(day);
            currentWeek.push(data || { date: day, pnl: 0, tradeCount: 0 });

            // 每週日結束（或月底）
            if (currentWeek.length === 7 || day === daysInMonth) {
                // 填充本週剩餘空格
                while (currentWeek.length < 7) {
                    currentWeek.push(null);
                }
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        return weeks;
    }, [year, month, dailyPnL]);

    // 計算每週總計
    const weeklyTotals = useMemo(() => {
        return calendarWeeks.map(week => {
            return week.reduce((total, day) => {
                if (day && day.pnl) {
                    return total + day.pnl;
                }
                return total;
            }, 0);
        });
    }, [calendarWeeks]);

    const handlePrevMonth = () => {
        const newDate = new Date(year, month - 1, 1);
        onMonthChange(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(year, month + 1, 1);
        onMonthChange(newDate);
    };

    const getPnLColor = (pnl: number) => {
        if (pnl > 0) return 'text-[var(--neon-green)]';
        if (pnl < 0) return 'text-[var(--neon-pink)]';
        return 'text-[var(--text-muted)]';
    };

    const getPnLBg = (pnl: number) => {
        if (pnl > 0) return 'bg-[var(--neon-green)]/10 border-[var(--neon-green)]/30';
        if (pnl < 0) return 'bg-[var(--neon-pink)]/10 border-[var(--neon-pink)]/30';
        return 'bg-[var(--bg-hover)] border-[var(--border-default)]';
    };

    const formatPnL = (pnl: number) => {
        if (pnl === 0) return '';
        const formatted = Math.abs(pnl).toLocaleString('zh-TW', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        return pnl > 0 ? `+${formatted}` : `-${formatted}`;
    };

    return (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
            {/* 標題與月份選擇器 */}
            <div className="flex items-center justify-center md:justify-between mb-6">
                <h2 className="hidden md:block text-lg font-semibold">{t.analytics.calendar.title}</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-base font-medium min-w-[120px] text-center">
                        {year} / {t.analytics.calendar.months[month]}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* 星期標題 */}
            <div className="grid grid-cols-7 sm:grid-cols-8 gap-1 mb-2">
                {t.analytics.calendar.weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-[var(--text-secondary)] py-1">
                        {day}
                    </div>
                ))}
                <div className="text-center text-xs font-medium text-[var(--text-secondary)] py-1 hidden sm:block">
                    {t.analytics.calendar.weeklyTotal}
                </div>
            </div>

            {/* 日曆格子（按週顯示） */}
            {calendarWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 sm:grid-cols-8 gap-1 mb-1">
                    {week.map((day, dayIndex) => (
                        <div
                            key={dayIndex}
                            className={`
                                aspect-square p-0.5 sm:p-1 md:p-2 rounded-lg border transition-colors overflow-hidden
                                ${day
                                    ? getPnLBg(day.pnl)
                                    : 'bg-transparent border-transparent'
                                }
                            `}
                        >
                            {day && (
                                <div className="relative w-full h-full flex flex-col justify-center items-center">
                                    <div className="absolute top-0 left-0 text-[10px] md:text-xs text-[var(--text-secondary)] leading-none">
                                        {day.date}
                                    </div>
                                    {day.tradeCount > 0 && (
                                        <div className="flex flex-col items-center z-10 pt-2">
                                            <div className={`text-[10px] md:text-xs font-semibold ${getPnLColor(day.pnl)} leading-tight text-center w-full truncate`}>
                                                {formatPnL(day.pnl)}
                                            </div>
                                            <div className="text-[9px] md:text-[10px] text-[var(--text-muted)] leading-none mt-0.5 text-center">
                                                {day.tradeCount}{t.analytics.calendar.tradeCountSuffix}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* 週總計 */}
                    <div
                        className={`
                            hidden sm:block aspect-square p-0.5 sm:p-1 md:p-2 rounded-lg border transition-colors font-semibold overflow-hidden
                            ${getPnLBg(weeklyTotals[weekIndex])}
                        `}
                    >
                        <div className="flex flex-col h-full justify-center items-center">
                            <div className={`text-[10px] md:text-sm ${getPnLColor(weeklyTotals[weekIndex])} text-center leading-tight break-all`}>
                                {formatPnL(weeklyTotals[weekIndex])}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* 圖例 */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[var(--neon-green)]/20 border border-[var(--neon-green)]/50"></div>
                    <span className="text-xs text-[var(--text-secondary)]">{t.analytics.calendar.profit}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[var(--neon-pink)]/20 border border-[var(--neon-pink)]/50"></div>
                    <span className="text-xs text-[var(--text-secondary)]">{t.analytics.calendar.loss}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[var(--bg-hover)] border border-[var(--border-default)]"></div>
                    <span className="text-xs text-[var(--text-secondary)]">{t.analytics.calendar.noTrade}</span>
                </div>
            </div>
        </div>
    );
}
