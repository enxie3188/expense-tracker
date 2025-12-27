import { Transaction } from '@/types';

/**
 * 取得指定月份的交易記錄
 */
export function getTransactionsByMonth(
    transactions: Transaction[],
    year: number,
    month: number // 1-12
): Transaction[] {
    return transactions.filter((t) => {
        const date = new Date(t.date);
        return date.getFullYear() === year && date.getMonth() === month - 1;
    });
}

/**
 * 取得指定年份的交易記錄
 */
export function getTransactionsByYear(
    transactions: Transaction[],
    year: number
): Transaction[] {
    return transactions.filter((t) => {
        const date = new Date(t.date);
        return date.getFullYear() === year;
    });
}

/**
 * 按分類統計支出
 */
export function getExpensesByCategory(transactions: Transaction[]): Record<string, number> {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    return categoryTotals;
}

/**
 * 按分類統計收入
 */
export function getIncomeByCategory(transactions: Transaction[]): Record<string, number> {
    const incomes = transactions.filter((t) => t.type === 'income');
    const categoryTotals: Record<string, number> = {};

    incomes.forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    return categoryTotals;
}

/**
 * 取得每日收支統計（用於趨勢圖）
 */
export function getDailyStats(
    transactions: Transaction[],
    year: number,
    month: number
): Array<{ date: string; income: number; expense: number }> {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyStats: Array<{ date: string; income: number; expense: number }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTransactions = transactions.filter((t) => t.date.startsWith(dateStr));

        const income = dayTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = dayTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        dailyStats.push({
            date: `${month}/${day}`,
            income,
            expense,
        });
    }

    return dailyStats;
}

/**
 * 取得月度統計（用於年度視圖）
 */
export function getMonthlyStats(
    transactions: Transaction[],
    year: number
): Array<{ month: string; income: number; expense: number }> {
    const monthlyStats: Array<{ month: string; income: number; expense: number }> = [];

    for (let month = 1; month <= 12; month++) {
        const monthTransactions = getTransactionsByMonth(transactions, year, month);

        const income = monthTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = monthTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        monthlyStats.push({
            month: `${month}月`,
            income,
            expense,
        });
    }

    return monthlyStats;
}
