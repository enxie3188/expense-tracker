import { TradingTransaction } from '@/types/ledger';
import { EquityPoint } from '@/types/ledger';

/**
 * 計算勝率 (Win Rate)
 * 勝率 = 獲利交易數 / 總交易數
 */
export function calculateWinRate(transactions: TradingTransaction[]): number {
    if (transactions.length === 0) return 0;

    const winningTrades = transactions.filter(t => t.pnl > 0).length;
    return (winningTrades / transactions.length) * 100;
}

/**
 * 計算盈虧比 (Profit Factor)
 * 盈虧比 = 總獲利 / 總虧損
 */
export function calculateProfitFactor(transactions: TradingTransaction[]): number {
    const totalProfit = transactions
        .filter(t => t.pnl > 0)
        .reduce((sum, t) => sum + t.pnl, 0);

    const totalLoss = Math.abs(
        transactions
            .filter(t => t.pnl < 0)
            .reduce((sum, t) => sum + t.pnl, 0)
    );

    if (totalLoss === 0) return totalProfit > 0 ? Infinity : 0;
    return totalProfit / totalLoss;
}

/**
 * 計算平均獲利/虧損
 */
export function calculateAveragePnL(transactions: TradingTransaction[]): {
    avgWin: number;
    avgLoss: number;
    avgTrade: number;
} {
    const winningTrades = transactions.filter(t => t.pnl > 0);
    const losingTrades = transactions.filter(t => t.pnl < 0);

    const avgWin = winningTrades.length > 0
        ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
        : 0;

    const avgLoss = losingTrades.length > 0
        ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length
        : 0;

    const avgTrade = transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.pnl, 0) / transactions.length
        : 0;

    return { avgWin, avgLoss, avgTrade };
}

/**
 * 計算期望值 (Expectancy)
 * 期望值 = (勝率 × 平均獲利) + ((1 - 勝率) × 平均虧損)
 */
export function calculateExpectancy(transactions: TradingTransaction[]): number {
    if (transactions.length === 0) return 0;

    const winRate = calculateWinRate(transactions) / 100;
    const { avgWin, avgLoss } = calculateAveragePnL(transactions);

    return (winRate * avgWin) + ((1 - winRate) * avgLoss);
}

/**
 * 計算 Sharpe Ratio
 * Sharpe Ratio = (平均報酬 - 無風險利率) / 報酬標準差
 */
export function calculateSharpeRatio(
    equityCurve: EquityPoint[],
    riskFreeRate: number = 0
): number {
    if (equityCurve.length < 2) return 0;

    // 計算每日報酬率
    const returns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
        const prevEquity = equityCurve[i - 1].equity;
        const currEquity = equityCurve[i].equity;
        const dailyReturn = (currEquity - prevEquity) / prevEquity;
        returns.push(dailyReturn);
    }

    if (returns.length === 0) return 0;

    // 計算平均報酬
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // 計算標準差
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    // 年化
    const sharpeRatio = ((avgReturn - riskFreeRate) / stdDev) * Math.sqrt(252); // 假設252個交易日

    return sharpeRatio;
}

/**
 * 計算最大回撤 (Max Drawdown)
 */
export function calculateMaxDrawdown(equityCurve: EquityPoint[]): {
    maxDrawdown: number;
    maxDrawdownPercent: number;
    peak: number;
    trough: number;
    peakDate?: string;
    troughDate?: string;
} {
    if (equityCurve.length === 0) {
        return {
            maxDrawdown: 0,
            maxDrawdownPercent: 0,
            peak: 0,
            trough: 0,
        };
    }

    let peak = equityCurve[0].equity;
    let peakDate = equityCurve[0].date;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let trough = peak;
    let troughDate = peakDate;

    for (const point of equityCurve) {
        if (point.equity > peak) {
            peak = point.equity;
            peakDate = point.date;
        }

        const drawdown = peak - point.equity;
        const drawdownPercent = (drawdown / peak) * 100;

        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
            maxDrawdownPercent = drawdownPercent;
            trough = point.equity;
            troughDate = point.date;
        }
    }

    return {
        maxDrawdown,
        maxDrawdownPercent,
        peak,
        trough,
        peakDate,
        troughDate,
    };
}

/**
 * 計算連續虧損統計
 */
export function calculateConsecutiveLosses(transactions: TradingTransaction[]): {
    maxConsecutiveLosses: number;
    maxConsecutiveLossAmount: number;
    currentStreak: number;
    currentStreakAmount: number;
} {
    if (transactions.length === 0) {
        return {
            maxConsecutiveLosses: 0,
            maxConsecutiveLossAmount: 0,
            currentStreak: 0,
            currentStreakAmount: 0,
        };
    }

    let maxConsecutiveLosses = 0;
    let maxConsecutiveLossAmount = 0;
    let currentStreak = 0;
    let currentStreakAmount = 0;
    let tempStreak = 0;
    let tempStreakAmount = 0;

    // 按日期排序
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const transaction of sortedTransactions) {
        if (transaction.pnl < 0) {
            tempStreak++;
            tempStreakAmount += transaction.pnl;

            if (tempStreak > maxConsecutiveLosses) {
                maxConsecutiveLosses = tempStreak;
            }
            if (tempStreakAmount < maxConsecutiveLossAmount) {
                maxConsecutiveLossAmount = tempStreakAmount;
            }
        } else {
            tempStreak = 0;
            tempStreakAmount = 0;
        }
    }

    // 檢查最後的連續虧損
    const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
    if (lastTransaction && lastTransaction.pnl < 0) {
        currentStreak = tempStreak;
        currentStreakAmount = tempStreakAmount;
    }

    return {
        maxConsecutiveLosses,
        maxConsecutiveLossAmount,
        currentStreak,
        currentStreakAmount,
    };
}

/**
 * 計算最大單筆獲利
 */
export function calculateMaxSingleWin(transactions: TradingTransaction[]): number {
    if (transactions.length === 0) return 0;
    const wins = transactions.filter(t => t.pnl > 0);
    if (wins.length === 0) return 0;
    return Math.max(...wins.map(t => t.pnl));
}

/**
 * 計算連續獲利統計
 */
export function calculateConsecutiveWins(transactions: TradingTransaction[]): {
    maxConsecutiveWins: number;
    maxConsecutiveWinAmount: number;
} {
    if (transactions.length === 0) {
        return {
            maxConsecutiveWins: 0,
            maxConsecutiveWinAmount: 0,
        };
    }

    let maxConsecutiveWins = 0;
    let maxConsecutiveWinAmount = 0;
    let tempStreak = 0;
    let tempStreakAmount = 0;

    // 按日期排序
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const transaction of sortedTransactions) {
        if (transaction.pnl > 0) {
            tempStreak++;
            tempStreakAmount += transaction.pnl;

            if (tempStreak > maxConsecutiveWins) {
                maxConsecutiveWins = tempStreak;
                maxConsecutiveWinAmount = tempStreakAmount;
            }
        } else {
            tempStreak = 0;
            tempStreakAmount = 0;
        }
    }

    return {
        maxConsecutiveWins,
        maxConsecutiveWinAmount,
    };
}

/**
 * 計算所有績效指標
 */
export function calculateAllMetrics(
    transactions: TradingTransaction[],
    equityCurve: EquityPoint[]
) {
    const winRate = calculateWinRate(transactions);
    const profitFactor = calculateProfitFactor(transactions);
    const { avgWin, avgLoss, avgTrade } = calculateAveragePnL(transactions);
    const expectancy = calculateExpectancy(transactions);
    const sharpeRatio = calculateSharpeRatio(equityCurve);
    const maxDrawdown = calculateMaxDrawdown(equityCurve);
    const consecutiveLosses = calculateConsecutiveLosses(transactions);
    const consecutiveWins = calculateConsecutiveWins(transactions);
    const maxSingleWin = calculateMaxSingleWin(transactions);

    const totalPnL = transactions.reduce((sum, t) => sum + t.pnl, 0);
    const totalTrades = transactions.length;
    const winningTrades = transactions.filter(t => t.pnl > 0).length;
    const losingTrades = transactions.filter(t => t.pnl < 0).length;

    return {
        // 基本統計
        totalTrades,
        winningTrades,
        losingTrades,
        totalPnL,

        // 績效指標
        winRate,
        profitFactor,
        avgWin,
        avgLoss,
        avgTrade,
        expectancy,
        sharpeRatio,

        // 風險指標
        maxDrawdown: maxDrawdown.maxDrawdown,
        maxDrawdownPercent: maxDrawdown.maxDrawdownPercent,
        maxDrawdownPeak: maxDrawdown.peak,
        maxDrawdownTrough: maxDrawdown.trough,

        // 連續虧損
        maxConsecutiveLosses: consecutiveLosses.maxConsecutiveLosses,
        maxConsecutiveLossAmount: consecutiveLosses.maxConsecutiveLossAmount,
        currentStreak: consecutiveLosses.currentStreak,

        // 新增指標
        maxSingleWin,
        maxConsecutiveWins: consecutiveWins.maxConsecutiveWins,
    };
}
