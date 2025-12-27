import { Transaction, FinancialStats } from '@/types';

/**
 * 計算財務統計資料
 * @param transactions 交易記錄陣列
 * @returns 包含總收入、總支出和餘額的物件
 */
export function calculateStats(transactions: Transaction[]): FinancialStats {
    const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return {
        totalIncome,
        totalExpense,
        balance,
    };
}

/**
 * 格式化金額（從分轉換為元，並加上貨幣符號）
 * @param amountInCents 以分為單位的金額
 * @param currency 貨幣符號
 * @returns 格式化後的字串
 */
export function formatAmount(amountInCents: number, currency = 'NT$'): string {
    const amountInDollars = amountInCents / 100;
    return `${currency}${amountInDollars.toLocaleString('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * 將金額從元轉換為分
 * @param amountInDollars 以元為單位的金額
 * @returns 以分為單位的金額
 */
export function convertToCents(amountInDollars: number): number {
    return Math.round(amountInDollars * 100);
}
