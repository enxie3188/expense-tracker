import { Ledger, TradingTransaction } from '@/types/ledger';
import { Transaction } from '@/types';

/**
 * 建立新帳本
 */
export function createLedger(
    name: string,
    assetType: Ledger['assetType'],
    currency: string = 'USD',
    icon: string = 'Wallet',
    color: string = 'blue'
): Ledger {
    return {
        id: crypto.randomUUID(),
        name,
        assetType,
        currency,
        icon,
        color,
        createdAt: new Date().toISOString(),
    };
}

/**
 * 取得特定帳本的交易記錄
 */
export function getTransactionsByLedger(
    transactions: (Transaction | TradingTransaction)[],
    ledgerId: string
): (Transaction | TradingTransaction)[] {
    return transactions.filter((t) => {
        // 向後兼容：如果是舊版 Transaction 且有 ledgerId，或是新版 TradingTransaction
        return ('ledgerId' in t && t.ledgerId === ledgerId);
    });
}

/**
 * 計算帳本統計資料
 */
export function getLedgerStats(
    transactions: (Transaction | TradingTransaction)[],
    ledgerId: string
): {
    totalTrades: number;
    totalPnL: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
} {
    const ledgerTransactions = getTransactionsByLedger(transactions, ledgerId);

    let totalPnL = 0;
    let winningTrades = 0;
    let losingTrades = 0;

    ledgerTransactions.forEach((tx) => {
        if ('pnl' in tx && tx.pnl !== undefined) {
            // TradingTransaction with PnL
            totalPnL += tx.pnl;
            if (tx.pnl > 0) winningTrades++;
            else if (tx.pnl < 0) losingTrades++;
        } else if ('amount' in tx && 'type' in tx) {
            // 舊版 Transaction（收支記帳）
            const amount = tx.amount;
            if (tx.type === 'income') {
                totalPnL += amount;
                winningTrades++;
            } else {
                totalPnL -= amount;
                losingTrades++;
            }
        }
    });

    const totalTrades = ledgerTransactions.length;
    const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

    return {
        totalTrades,
        totalPnL,
        winningTrades,
        losingTrades,
        winRate,
    };
}

/**
 * 刪除帳本（同時刪除該帳本的所有交易）
 */
export function deleteLedger(
    transactions: (Transaction | TradingTransaction)[],
    ledgerId: string
): (Transaction | TradingTransaction)[] {
    return transactions.filter((t) => {
        return !('ledgerId' in t && t.ledgerId === ledgerId);
    });
}

/**
 * 計算 PnL（損益）
 */
export function calculatePnL(
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    type: 'long' | 'short',
    pointValue: number = 1,
    commission: number = 0
): number {
    let pnl: number;

    if (type === 'long') {
        pnl = (exitPrice - entryPrice) * quantity * pointValue;
    } else {
        // short
        pnl = (entryPrice - exitPrice) * quantity * pointValue;
    }

    return pnl - commission;
}
