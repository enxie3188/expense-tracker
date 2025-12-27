import { Transaction } from '@/types';

/**
 * 將交易按日期分組
 */
export function groupTransactionsByDate(transactions: Transaction[]): Map<string, Transaction[]> {
    const groups = new Map<string, Transaction[]>();

    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        if (!groups.has(dateKey)) {
            groups.set(dateKey, []);
        }
        groups.get(dateKey)!.push(transaction);
    });

    return groups;
}

/**
 * 格式化日期顯示 (例如: 12/25 週四)
 */
export function formatDateDisplay(dateString: string): string {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = getWeekday(date);

    return `${month}/${day} ${weekday}`;
}

/**
 * 取得星期幾
 */
function getWeekday(date: Date): string {
    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return weekdays[date.getDay()];
}

/**
 * 計算單日淨額
 */
export function calculateDailyNet(transactions: Transaction[]): number {
    return transactions.reduce((sum, t) => {
        return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
}
