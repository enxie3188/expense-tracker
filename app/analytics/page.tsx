'use client';

import { useFinance } from '@/hooks/useFinance';
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useMemo, useRef, useEffect } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { ProfitCalendar } from '@/components/ProfitCalendar';
import { calculateAllMetrics } from '@/lib/performanceMetrics';
import { calculateEquityCurve } from '@/lib/equityCurve';
import { TradingTransaction } from '@/types/ledger';
import { TrendingUp, TrendingDown, Target, Activity, ChevronDown, Plus } from 'lucide-react';

export default function AnalyticsPage() {
    const { transactions, strategies, ledgers, currentLedgerId } = useFinance();
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>('all');
    const [selectedLedgerId, setSelectedLedgerId] = useState<string>('all');
    const [filterType, setFilterType] = useState<'strategy' | 'ledger'>('ledger'); // Default to ledger
    const [isStrategyDropdownOpen, setIsStrategyDropdownOpen] = useState(false);
    const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);

    const strategyDropdownRef = useRef<HTMLDivElement>(null);
    const ledgerDropdownRef = useRef<HTMLDivElement>(null);

    // 當全域帳本改變時，同步更新篩選器
    useEffect(() => {
        if (currentLedgerId) {
            setSelectedLedgerId(currentLedgerId);
            setFilterType('ledger');
        }
    }, [currentLedgerId]);

    // 點擊外部關閉下拉選單
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (strategyDropdownRef.current && !strategyDropdownRef.current.contains(event.target as Node)) {
                setIsStrategyDropdownOpen(false);
            }
            if (ledgerDropdownRef.current && !ledgerDropdownRef.current.contains(event.target as Node)) {
                setIsLedgerDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    // 篩選交易
    const filteredTransactions = useMemo(() => {
        // 將一般 Transaction 視為 TradingTransaction 處理，並過濾掉沒有 PnL 的資料
        const tradingTransactions = transactions as unknown as TradingTransaction[];
        let base = tradingTransactions.filter(t => t.pnl !== undefined);

        if (filterType === 'strategy') {
            if (selectedStrategyId !== 'all') {
                return base.filter(t => t.strategyId === selectedStrategyId);
            }
        } else {
            if (selectedLedgerId !== 'all') {
                return base.filter(t => t.ledgerId === selectedLedgerId);
            }
        }
        return base;
    }, [transactions, selectedStrategyId, selectedLedgerId, filterType]);

    // 生成權益曲線
    const equityCurve = useMemo(() => {
        if (filteredTransactions.length === 0) return [];
        return calculateEquityCurve(filteredTransactions, 10000);
    }, [filteredTransactions]);

    // 計算績效指標
    const metrics = useMemo(() => {
        return calculateAllMetrics(filteredTransactions, equityCurve);
    }, [filteredTransactions, equityCurve]);

    const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);
    const selectedLedger = ledgers.find(l => l.id === selectedLedgerId);
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-24 lg:pb-8 w-full">
            <div className="max-w-full mx-auto px-4 lg:px-8 py-8 pt-16 lg:pt-8">
                {/* 標題 */}
                <div className="mb-8 relative">
                    <h1 className="text-3xl font-bold mb-2">{t.analytics.title}</h1>
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('openAddTransaction'));
                        }}
                        className="hidden lg:flex absolute top-0 right-0 items-center gap-2 px-4 py-2 bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-white rounded-lg transition-colors shadow-lg"
                    >
                        <Plus size={20} />
                        {t.common.add}
                    </button>
                </div>

                {/* 篩選器區域：策略與帳本 */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-8 w-full">
                    {/* Strategy Selector */}
                    <div className="relative flex-1" ref={strategyDropdownRef}>
                        <button
                            onClick={() => setIsStrategyDropdownOpen(!isStrategyDropdownOpen)}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-3 bg-[var(--bg-secondary)] border ${filterType === 'strategy' ? 'border-[var(--neon-blue)]' : 'border-[var(--border-default)]'
                                } rounded-lg hover:border-[var(--neon-blue)] transition-colors`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                {selectedStrategyId === 'all' ? (
                                    <span className="truncate">{t.analytics.allStrategies}</span>
                                ) : (
                                    <>
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: selectedStrategy?.color }}
                                        />
                                        <span className="truncate">{selectedStrategy?.name}</span>
                                    </>
                                )}
                            </div>
                            <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-200 ${isStrategyDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isStrategyDropdownOpen && (
                            <div className="absolute left-0 mt-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-xl py-1 z-20 max-h-[300px] overflow-y-auto">
                                <button
                                    onClick={() => {
                                        setSelectedStrategyId('all');
                                        setFilterType('strategy');
                                        setSelectedLedgerId('all');
                                        setIsStrategyDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
                                >
                                    <span>{t.analytics.allStrategies}</span>
                                </button>
                                {strategies.map(strategy => (
                                    <button
                                        key={strategy.id}
                                        onClick={() => {
                                            setSelectedStrategyId(strategy.id);
                                            setFilterType('strategy');
                                            setSelectedLedgerId('all');
                                            setIsStrategyDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: strategy.color }}
                                        />
                                        <span className="truncate">{strategy.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <span className="text-[var(--text-secondary)] text-sm whitespace-nowrap px-1">{t.common.or}</span>

                    {/* Ledger Selector */}
                    <div className="relative flex-1" ref={ledgerDropdownRef}>
                        <button
                            onClick={() => setIsLedgerDropdownOpen(!isLedgerDropdownOpen)}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-3 bg-[var(--bg-secondary)] border ${filterType === 'ledger' ? 'border-[var(--neon-blue)]' : 'border-[var(--border-default)]'
                                } rounded-lg hover:border-[var(--neon-blue)] transition-colors`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                {selectedLedgerId === 'all' ? (
                                    <span className="truncate">{t.analytics.allLedgers}</span>
                                ) : (
                                    <>
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: selectedLedger?.color }}
                                        />
                                        <span className="truncate">{selectedLedger?.name}</span>
                                    </>
                                )}
                            </div>
                            <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-200 ${isLedgerDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isLedgerDropdownOpen && (
                            <div className="absolute left-0 mt-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-xl py-1 z-20 max-h-[300px] overflow-y-auto">
                                <button
                                    onClick={() => {
                                        setSelectedLedgerId('all');
                                        setFilterType('ledger');
                                        setSelectedStrategyId('all');
                                        setIsLedgerDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
                                >
                                    <span>{t.analytics.allLedgers}</span>
                                </button>
                                {ledgers.map(ledger => (
                                    <button
                                        key={ledger.id}
                                        onClick={() => {
                                            setSelectedLedgerId(ledger.id);
                                            setFilterType('ledger');
                                            setSelectedStrategyId('all');
                                            setIsLedgerDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: ledger.color }}
                                        />
                                        <span className="truncate">{ledger.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>



                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-[var(--text-muted)] text-lg mb-2">
                            {t.common.noData}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* 左側：盈利日曆 (2/3) */}
                        <div className="flex-[2]">
                            <ProfitCalendar
                                transactions={filteredTransactions}
                                selectedMonth={selectedMonth}
                                onMonthChange={setSelectedMonth}
                            />
                        </div>

                        {/* 右側：績效指標 (1/3) - 網格排列 */}
                        <div className="flex-1">
                            <div className="grid grid-cols-3 gap-3">
                                {/* 核心績效 */}
                                <div className="col-span-3 text-xs font-medium text-[var(--text-secondary)] mt-1 mb-1">{t.analytics.metrics.coreMetrics}</div>
                                <MetricCard
                                    title={t.analytics.metrics.totalPnL}
                                    value={metrics.totalPnL}
                                    format="currency"
                                    icon={metrics.totalPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                />
                                <MetricCard
                                    title={t.analytics.metrics.winRate}
                                    value={metrics.winRate}
                                    format="percentage"
                                    icon={<Target size={16} />}
                                />
                                <MetricCard
                                    title={t.analytics.metrics.totalTrades}
                                    value={metrics.totalTrades}
                                    icon={<Activity size={16} />}
                                />

                                {/* 獲利分析 */}
                                <div className="col-span-3 text-xs font-medium text-[var(--text-secondary)] mt-2 mb-1">{t.analytics.metrics.profitAnalysis}</div>
                                <MetricCard
                                    title={t.analytics.metrics.profitFactor}
                                    value={metrics.profitFactor}
                                    format="ratio"
                                    icon={<TrendingUp size={16} />}
                                />
                                <MetricCard
                                    title={t.analytics.metrics.avgWin}
                                    value={metrics.avgWin}
                                    format="currency"
                                    subtitle={`${metrics.winningTrades} ${t.analytics.metrics.winTrades}`}
                                />
                                <MetricCard
                                    title={t.analytics.metrics.avgLoss}
                                    value={metrics.avgLoss}
                                    format="currency"
                                    isNegative
                                    subtitle={`${metrics.losingTrades} ${t.analytics.metrics.lossTrades}`}
                                />
                                <MetricCard
                                    title={t.analytics.metrics.expectancy}
                                    value={metrics.expectancy}
                                    format="currency"
                                />
                                <MetricCard
                                    title={t.analytics.metrics.maxSingleWin}
                                    value={metrics.maxSingleWin}
                                    format="currency"
                                />
                                <MetricCard
                                    title={t.analytics.metrics.maxConsecutiveWins}
                                    value={metrics.maxConsecutiveWins}
                                />

                                {/* 風險指標 */}
                                <div className="col-span-3 text-xs font-medium text-[var(--text-secondary)] mt-2 mb-1">{t.analytics.metrics.riskMetrics}</div>
                                <MetricCard
                                    title={t.analytics.metrics.maxDrawdown}
                                    value={metrics.maxDrawdownPercent}
                                    format="percentage"
                                    isNegative
                                />
                                <MetricCard
                                    title={t.analytics.metrics.sharpeRatio}
                                    value={metrics.sharpeRatio}
                                    format="ratio"
                                />
                                <MetricCard
                                    title={t.analytics.metrics.maxConsecutiveLosses}
                                    value={metrics.maxConsecutiveLosses}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
