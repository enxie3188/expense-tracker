import { Strategy, TradingTransaction, StrategyMetrics } from '@/types/ledger';

/**
 * 建立新策略
 */
export function createStrategy(
    name: string,
    description?: string,
    color: string = '#3b82f6'
): Strategy {
    return {
        id: crypto.randomUUID(),
        name,
        description,
        color,
        createdAt: new Date().toISOString(),
    };
}

/**
 * 取得特定策略的交易記錄
 */
export function getTransactionsByStrategy(
    transactions: TradingTransaction[],
    strategyId: string
): TradingTransaction[] {
    return transactions.filter((t) => t.strategyId === strategyId);
}

/**
 * 計算策略績效指標
 */
export function calculateStrategyMetrics(
    transactions: TradingTransaction[],
    strategyId: string
): StrategyMetrics {
    const strategyTransactions = getTransactionsByStrategy(transactions, strategyId);

    if (strategyTransactions.length === 0) {
        return {
            strategyId,
            totalTrades: 0,
            winRate: 0,
            totalPnL: 0,
            avgPnL: 0,
            sharpeRatio: 0,
            maxDrawdown: 0,
            profitFactor: 0,
            avgWinLossRatio: 0,
        };
    }

    const totalTrades = strategyTransactions.length;
    let totalPnL = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;
    const pnlArray: number[] = [];

    // 計算基本指標
    strategyTransactions.forEach((tx) => {
        const pnl = tx.pnl || 0;
        totalPnL += pnl;
        pnlArray.push(pnl);

        if (pnl > 0) {
            totalWins++;
            totalWinAmount += pnl;
        } else if (pnl < 0) {
            totalLosses++;
            totalLossAmount += Math.abs(pnl);
        }
    });

    // 勝率
    const winRate = totalTrades > 0 ? totalWins / totalTrades : 0;

    // 平均盈虧
    const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;

    // 獲利因子
    const profitFactor =
        totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0;

    // 平均盈虧比
    const avgWin = totalWins > 0 ? totalWinAmount / totalWins : 0;
    const avgLoss = totalLosses > 0 ? totalLossAmount / totalLosses : 0;
    const avgWinLossRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    // Sharpe Ratio（簡化版：假設無風險利率為 0）
    const sharpeRatio = calculateSharpeRatio(pnlArray);

    // 最大回撤
    const maxDrawdown = calculateMaxDrawdown(pnlArray);

    return {
        strategyId,
        totalTrades,
        winRate,
        totalPnL,
        avgPnL,
        sharpeRatio,
        maxDrawdown,
        profitFactor,
        avgWinLossRatio,
    };
}

/**
 * 計算夏普比率（Sharpe Ratio）
 * 假設無風險利率為 0
 */
function calculateSharpeRatio(returns: number[]): number {
    if (returns.length === 0) return 0;

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance =
        returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev > 0 ? mean / stdDev : 0;
}

/**
 * 計算最大回撤（Max Drawdown）百分比
 */
function calculateMaxDrawdown(pnlArray: number[]): number {
    if (pnlArray.length === 0) return 0;

    let peak = 0;
    let maxDrawdown = 0;
    let cumulativePnL = 0;

    pnlArray.forEach((pnl) => {
        cumulativePnL += pnl;
        peak = Math.max(peak, cumulativePnL);
        const drawdown = peak - cumulativePnL;
        const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
        maxDrawdown = Math.max(maxDrawdown, drawdownPercent);
    });

    return maxDrawdown;
}

/**
 * 比較多個策略
 */
export function compareStrategies(
    transactions: TradingTransaction[],
    strategyIds: string[]
): StrategyMetrics[] {
    return strategyIds.map((id) => calculateStrategyMetrics(transactions, id));
}
