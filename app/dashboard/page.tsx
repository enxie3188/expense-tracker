'use client';

import { useState, useEffect } from 'react';
import { useMasterDashboard, TimeRange } from '@/hooks/useMasterDashboard';
import { EquityCurve } from '@/components/EquityCurve';
import { TrendingUp, TrendingDown, Wallet, Activity, Plus } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';
import { OnboardingTour } from '@/components/OnboardingTour';
import { NoLedgerState, NoTransactionState } from '@/components/EmptyState';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { settings, isLoaded } = useSettings();
    const { t } = useTranslation();
    const router = useRouter();
    const [timeRange, setTimeRange] = useState<TimeRange>(settings.chart.defaultTimeRange);
    const { ledgers, transactions, isLoading: financeLoading } = useFinance();
    const [selectedLedgerId, setSelectedLedgerId] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 當 settings 和 ledgers 加載後，設置預設帳本
    useEffect(() => {
        if (isLoaded && ledgers.length > 0 && !selectedLedgerId) {
            // 優先使用設定中的預設帳本，否則使用第一個
            const defaultId = settings.ledger.defaultLedgerId || ledgers[0].id;
            setSelectedLedgerId(defaultId);
        }
    }, [isLoaded, ledgers, selectedLedgerId, settings.ledger.defaultLedgerId]);

    // 更新時間範圍為設定中的預設值
    useEffect(() => {
        if (isLoaded) {
            setTimeRange(settings.chart.defaultTimeRange);
        }
    }, [isLoaded, settings.chart.defaultTimeRange]);



    // 獲取當前選中帳本的初始餘額
    const currentLedger = ledgers.find(l => l.id === selectedLedgerId);
    const startBalance = currentLedger?.initialBalance || 10000;

    const { equityCurve, metrics, isProfit, totalLedgers, totalTrades } = useMasterDashboard(timeRange, startBalance, selectedLedgerId);

    const timeRanges: TimeRange[] = ['1D', '1W', '1M', '1Y', 'ALL'];

    // 格式化貨幣（使用設定中的幣種）
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: settings.transaction.defaultCurrency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // 格式化百分比
    const formatPercent = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    // 計算基於時間範圍的交易數量
    const getTimeRangeTradeCount = () => {
        // 如果是 ALL，直接返回總交易數 (由 useMasterDashboard 計算，已包含 ledger 篩選)
        if (timeRange === 'ALL') return totalTrades;

        const now = new Date();
        let cutoffDate: Date | null = null;

        switch (timeRange) {
            case '1D':
                cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '1W':
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '1M':
                cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '1Y':
                cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
        }

        // 從原始交易數據中篩選，而不是從 equityCurve (因為 equityCurve 包含合成的起始點)
        const relevantTransactions = transactions.filter(t => {
            // 1. 篩選帳本 (如果有選)
            if (selectedLedgerId && t.ledgerId !== selectedLedgerId) return false;

            // 2. 篩選時間
            if (cutoffDate) {
                const txDate = new Date(t.date);
                if (txDate < cutoffDate) return false;
            }

            return true;
        });

        return relevantTransactions.length;
    };

    const timeRangeTradeCount = getTimeRangeTradeCount();

    // 計算當前時間範圍的總盈虧百分比
    const currentEquity = metrics.currentEquity;
    // 如果沒有數據，使用初始資金
    const periodStartEquity = equityCurve.length > 0 ? equityCurve[0].equity : startBalance;
    const periodPnLValue = currentEquity - periodStartEquity;
    const periodPercent = periodStartEquity > 0 ? (periodPnLValue / periodStartEquity) * 100 : 0;

    // 如果是 ALL 時間範圍，我們可以用更準確的 totalPnLPercent (基於初始資金)
    // 但如果 equityCurve[0] 總是包含起始點，上述邏輯也是一致的。
    // 為了保險，如果是 ALL，使用 metrics.totalPnLPercent
    const displayPercent = timeRange === 'ALL' ? metrics.totalPnLPercent : periodPercent;

    if (!mounted) return null;

    // 導航到設定頁面創建帳本
    const handleCreateLedger = () => {
        router.push('/settings');
    };

    // 沒有帳本時顯示空狀態
    if (!financeLoading && ledgers.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] pb-24 lg:pb-8 w-full">
                <OnboardingTour />
                <div className="max-w-full mx-auto px-4 lg:px-8 py-8 pt-16 lg:pt-8">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold mb-2">{t.dashboard.title}</h1>
                    </div>
                    <div className="card-dark p-8">
                        <NoLedgerState onCreateLedger={handleCreateLedger} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-24 lg:pb-8 w-full">
            <OnboardingTour />
            <div className="max-w-full mx-auto px-4 lg:px-8 py-8 pt-16 lg:pt-8">
                {/* Header */}
                <div className="mb-6 relative">
                    <h1 className="text-4xl font-bold mb-2">{t.dashboard.title}</h1>

                    {/* Add Transaction Button - Desktop Only */}
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('openAddTransaction'));
                        }}
                        className="hidden lg:flex absolute top-0 right-0 items-center gap-2 px-4 py-2 bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-white rounded-lg transition-colors shadow-lg"
                    >
                        <Plus size={20} />
                        {t.dashboard.addTransaction}
                    </button>
                </div>

                {/* Ledger Tabs */}
                <div className="mb-6 border-b border-[var(--border-default)]">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {ledgers.map((ledger) => (
                            <button
                                key={ledger.id}
                                onClick={() => setSelectedLedgerId(ledger.id)}
                                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${selectedLedgerId === ledger.id
                                    ? 'bg-[var(--neon-blue)] text-white'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                    }`}
                            >
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: ledger.color }}
                                />
                                {ledger.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Equity Curve */}
                <div className="card-dark p-4 lg:p-6 mb-8">
                    {/* Mobile & Desktop Layout */}
                    <div className="mb-6">
                        {/* Metrics - Horizontal on Desktop, Vertical on Mobile */}
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-0 mb-4 lg:mb-0">
                            <div className="flex flex-row items-end justify-between lg:gap-8">
                                {/* Total Equity */}
                                <div className="flex-shrink-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wallet size={18} className="text-[var(--neon-blue)]" />
                                        <span className="text-xs text-[var(--text-secondary)]">{t.dashboard.totalEquity}</span>
                                    </div>
                                    <div className="text-2xl lg:text-3xl font-bold mb-1">
                                        {formatCurrency(metrics.currentEquity)}
                                    </div>
                                    <div className={`text-xs lg:text-sm ${displayPercent >= 0 ? 'text-[var(--neon-green)]' : 'text-[var(--neon-pink)]'}`}>
                                        {formatPercent(displayPercent)}
                                    </div>
                                </div>

                                {/* Dynamic Time-based Change */}
                                <div className="flex-shrink-0">
                                    <div className="text-xs text-[var(--text-muted)] mb-2">
                                        {timeRange === '1D' && t.dashboard.dayChange}
                                        {timeRange === '1W' && t.dashboard.weekChange}
                                        {timeRange === '1M' && t.dashboard.monthChange}
                                        {timeRange === '1Y' && t.dashboard.yearChange}
                                        {timeRange === 'ALL' && t.dashboard.totalChange}
                                    </div>
                                    <div className={`text-xl lg:text-2xl font-bold ${(timeRange === '1D' && metrics.dayPnL >= 0) ||
                                        (timeRange === '1W' && metrics.weekPnL >= 0) ||
                                        (timeRange === '1M' && metrics.monthPnL >= 0) ||
                                        (timeRange === '1Y' && metrics.yearPnL >= 0) ||
                                        (timeRange === 'ALL' && metrics.totalPnL >= 0)
                                        ? 'text-[var(--neon-green)]'
                                        : 'text-[var(--neon-pink)]'
                                        }`}>
                                        {timeRange === '1D' && formatCurrency(metrics.dayPnL)}
                                        {timeRange === '1W' && formatCurrency(metrics.weekPnL)}
                                        {timeRange === '1M' && formatCurrency(metrics.monthPnL)}
                                        {timeRange === '1Y' && formatCurrency(metrics.yearPnL)}
                                        {timeRange === 'ALL' && formatCurrency(metrics.totalPnL)}
                                    </div>
                                </div>

                                {/* Dynamic Trade Count */}
                                <div className="flex-shrink-0">
                                    <div className="text-xs text-[var(--text-muted)] mb-2">{t.dashboard.tradeCount}</div>
                                    <div className="text-xl lg:text-2xl font-bold text-[var(--neon-blue)]">
                                        {timeRangeTradeCount}
                                    </div>
                                </div>
                            </div>

                            {/* Time Range Selector - Desktop Only (Hidden on Mobile) */}
                            <div className="hidden lg:flex gap-2">
                                {timeRanges.map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                                            ? 'bg-[var(--neon-blue)] text-white'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <EquityCurve
                        data={equityCurve}
                        isProfit={isProfit}
                        startBalance={startBalance}
                        timeRange={timeRange}
                    />

                    {/* Time Range Selector - Mobile Only (Below Chart) */}
                    <div className="flex lg:hidden gap-2 mt-4 justify-center flex-wrap">
                        {timeRanges.map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                                    ? 'bg-[var(--neon-blue)] text-white'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
