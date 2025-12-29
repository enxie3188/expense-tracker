'use client';

import { useMemo } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { TradingTransaction } from '@/types/ledger';
import {
    aggregateEquityCurves,
    calculatePnLMetrics,
    filterByTimeRange
} from '@/lib/equityCurve';

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

/**
 * Master Dashboard 專用 Hook
 * 聚合所有帳本的資料並計算全局權益曲線
 * @param timeRange 時間範圍
 * @param startBalance 初始資金
 * @param ledgerId 可選，指定帳本 ID 則只顯示該帳本的數據
 */
export function useMasterDashboard(
    timeRange: TimeRange = 'ALL',
    startBalance: number = 10000,
    ledgerId?: string
) {
    const { transactions, ledgers } = useFinance();

    // 篩選出 TradingTransaction（有 pnl 欄位的交易）
    const tradingTransactions = useMemo(() => {
        let filtered = transactions.filter((t) => {
            // 檢查是否有 pnl 欄位並且不是 undefined/null
            return 'pnl' in t && t.pnl !== undefined && t.pnl !== null;
        });

        // 如果指定了 ledgerId，進一步篩選
        if (ledgerId && ledgerId !== 'all') {
            filtered = filtered.filter((t) => t.ledgerId === ledgerId);
        }

        // Type assertion after filtering
        return filtered as TradingTransaction[];
    }, [transactions, ledgerId]);

    // Debug: 輸出交易資料
    console.log('All transactions:', transactions);
    console.log('Trading transactions (with pnl):', tradingTransactions);

    // 計算全局權益曲線
    const equityCurve = useMemo(() => {
        if (tradingTransactions.length === 0) {
            console.log('No trading transactions found');
            return [];
        }

        const curve = aggregateEquityCurves(tradingTransactions, startBalance);
        console.log('Equity curve:', curve);

        // filterByTimeRange 會自動在時間範圍起點添加合成起始點，不需要在這裡額外添加
        const curveWithEnd: typeof curve = [...curve];

        // 添加當前時間點（如果最後一筆交易不是今天）
        if (curveWithEnd.length > 0) {
            const lastPoint = curveWithEnd[curveWithEnd.length - 1];
            const lastDate = new Date(lastPoint.date);
            const now = new Date();

            // 如果最後一筆交易不是今天，添加一個"現在"的點
            const isSameDay = lastDate.getFullYear() === now.getFullYear() &&
                lastDate.getMonth() === now.getMonth() &&
                lastDate.getDate() === now.getDate();

            // 如果最後交易超過 1 小時，就添加當前點
            const hoursSinceLastTrade = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastTrade > 1) {
                curveWithEnd.push({
                    date: now.toISOString(),
                    equity: lastPoint.equity, // 維持最後的權益值
                    pnl: 0,
                });
            }
        }

        // 不再使用 resampleToDaily，保留每筆交易的點
        return filterByTimeRange(curveWithEnd, timeRange);
    }, [tradingTransactions, startBalance, timeRange]);

    // 計算 PnL 指標
    const metrics = useMemo(() => {
        return calculatePnLMetrics(equityCurve, startBalance);
    }, [equityCurve, startBalance]);

    // 判斷整體盈虧狀態
    const isProfit = metrics.totalPnL >= 0;

    return {
        equityCurve,
        metrics,
        isProfit,
        totalLedgers: ledgers.length,
        totalTrades: tradingTransactions.length,
    };
}
