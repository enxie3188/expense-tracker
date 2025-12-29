import { TradingTransaction, EquityPoint } from '@/types/ledger';

/**
 * 計算權益曲線（單一帳本或策略）
 */
export function calculateEquityCurve(
    transactions: TradingTransaction[],
    startBalance: number = 10000
): EquityPoint[] {
    // 按日期排序
    const sorted = [...transactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const curve: EquityPoint[] = [];
    let currentEquity = startBalance;

    if (sorted.length > 0) {
        // 添加初始點：在第一筆交易當天的 00:00:00
        const firstDate = new Date(sorted[0].date);
        const startDate = new Date(firstDate);
        startDate.setHours(0, 0, 0, 0);

        curve.push({
            date: startDate.toISOString(),
            equity: startBalance,
            pnl: 0,
        });
    }

    sorted.forEach((tx) => {
        const pnl = tx.pnl || 0;
        currentEquity += pnl;

        curve.push({
            date: tx.date,
            equity: currentEquity,
            pnl: pnl,
        });
    });

    return curve;
}

/**
 * 聚合多個帳本的權益曲線
 */
export function aggregateEquityCurves(
    allTransactions: TradingTransaction[],
    startBalance: number = 10000
): EquityPoint[] {
    // 按日期排序所有交易
    const sorted = [...allTransactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const curve: EquityPoint[] = [];
    let currentEquity = startBalance;

    if (sorted.length > 0) {
        const firstDate = new Date(sorted[0].date);
        const startDate = new Date(firstDate);
        startDate.setHours(0, 0, 0, 0);

        curve.push({
            date: startDate.toISOString(),
            equity: startBalance,
            pnl: 0,
        });
    }

    sorted.forEach((tx) => {
        const pnl = tx.pnl || 0;
        currentEquity += pnl;

        curve.push({
            date: tx.date,
            equity: currentEquity,
            pnl: pnl,
            // 添加交易詳情（支持 ticker/symbol 和 type/direction 的兼容性）
            symbol: tx.symbol || tx.ticker,
            direction: tx.direction || tx.type,
            quantity: tx.quantity,
        });
    });

    return curve;
}

/**
 * 重採樣為每日資料點（將多筆同日交易合併）
 */
export function resampleToDaily(curve: EquityPoint[]): EquityPoint[] {
    const dailyMap = new Map<string, EquityPoint>();

    curve.forEach((point) => {
        const dateKey = point.date.split('T')[0]; // 取日期部分

        if (dailyMap.has(dateKey)) {
            const existing = dailyMap.get(dateKey)!;
            existing.equity = point.equity; // 使用當日最後的權益值
            existing.pnl += point.pnl; // 累加當日 PnL
        } else {
            dailyMap.set(dateKey, {
                date: dateKey,
                equity: point.equity,
                pnl: point.pnl,
            });
        }
    });

    return Array.from(dailyMap.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

/**
 * 計算 PnL 指標（百分比變動、時間範圍統計）
 */
export function calculatePnLMetrics(
    curve: EquityPoint[],
    startBalance: number = 10000
): {
    currentEquity: number;
    totalPnL: number;
    totalPnLPercent: number;
    dayPnL: number;
    weekPnL: number;
    monthPnL: number;
    yearPnL: number;
} {
    if (curve.length === 0) {
        return {
            currentEquity: startBalance,
            totalPnL: 0,
            totalPnLPercent: 0,
            dayPnL: 0,
            weekPnL: 0,
            monthPnL: 0,
            yearPnL: 0,
        };
    }

    const currentEquity = curve[curve.length - 1].equity;
    const totalPnL = currentEquity - startBalance;
    const totalPnLPercent = (totalPnL / startBalance) * 100;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const getPnLSince = (since: Date): number => {
        const filtered = curve.filter((p) => new Date(p.date) >= since);
        return filtered.reduce((sum, p) => sum + p.pnl, 0);
    };

    return {
        currentEquity,
        totalPnL,
        totalPnLPercent,
        dayPnL: getPnLSince(oneDayAgo),
        weekPnL: getPnLSince(oneWeekAgo),
        monthPnL: getPnLSince(oneMonthAgo),
        yearPnL: getPnLSince(oneYearAgo),
    };
}

/**
 * 篩選時間範圍
 * 重要：總是保留起始點，確保曲線有完整的上下文
 */
export function filterByTimeRange(
    curve: EquityPoint[],
    range: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'
): EquityPoint[] {
    if (range === 'ALL' || curve.length === 0) return curve;

    const now = new Date();
    let startDate: Date;

    switch (range) {
        case '1D':
            // 使用今天的 00:00 作為起始時間
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            break;
        case '1W':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '1M':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '3M':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case '1Y':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        default:
            return curve;
    }

    // 過濾在時間範圍內的點
    const filteredPoints = curve.filter((p) => new Date(p.date) >= startDate);

    // 如果過濾後沒有點，需要額外處理
    if (filteredPoints.length === 0) {
        // 對於 1D，創建一個在 00:00 的合成起始點
        if (range === '1D' && curve.length > 0) {
            const lastKnownEquity = curve[curve.length - 1].equity;
            return [{
                date: startDate.toISOString(),
                equity: lastKnownEquity,
                pnl: 0,
            }];
        }
        // 其他範圍：返回最後一個點作為參考
        return [curve[curve.length - 1]];
    }

    // 對於 1D: 不加入前一天的點，改為創建 00:00 的合成起始點
    if (range === '1D') {
        // 找到第一個被包含的點之前的最後一個點，獲取其權益值
        const firstIncludedIndex = curve.findIndex(p => p.date === filteredPoints[0].date);
        if (firstIncludedIndex > 0) {
            const previousEquity = curve[firstIncludedIndex - 1].equity;
            // 創建 00:00 的合成起始點
            const syntheticStartPoint: EquityPoint = {
                date: startDate.toISOString(),
                equity: previousEquity,
                pnl: 0,
            };
            return [syntheticStartPoint, ...filteredPoints];
        }
        return filteredPoints;
    }

    // 其他時間範圍（1W, 1M, 1Y 等）：在時間範圍起點創建合成起始點
    if (filteredPoints.length > 0 && filteredPoints[0].date !== curve[0].date) {
        const firstIncludedIndex = curve.findIndex(p => p.date === filteredPoints[0].date);
        if (firstIncludedIndex > 0) {
            const previousEquity = curve[firstIncludedIndex - 1].equity;
            // 在時間範圍的起點創建合成起始點（而不是使用前一個交易的時間）
            const syntheticStartPoint: EquityPoint = {
                date: startDate.toISOString(),
                equity: previousEquity,
                pnl: 0,
            };
            return [syntheticStartPoint, ...filteredPoints];
        }
    }

    // 如果第一個過濾點就是 curve 的第一個點，仍需在時間範圍起點添加合成點
    if (filteredPoints.length > 0) {
        const firstFilteredDate = new Date(filteredPoints[0].date);
        // 如果第一個過濾點的時間晚於範圍起點，添加合成起始點
        if (firstFilteredDate > startDate) {
            // 取得第一個過濾點之前的權益值（可能是 curve[0] 之前的初始餘額）
            const firstIncludedIndex = curve.findIndex(p => p.date === filteredPoints[0].date);
            const previousEquity = firstIncludedIndex > 0 ? curve[firstIncludedIndex - 1].equity : curve[0].equity;
            const syntheticStartPoint: EquityPoint = {
                date: startDate.toISOString(),
                equity: previousEquity,
                pnl: 0,
            };
            return [syntheticStartPoint, ...filteredPoints];
        }
    }

    return filteredPoints;
}
