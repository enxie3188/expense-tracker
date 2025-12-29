import { createClient } from '@/utils/supabase/client';
import { Ledger, Strategy, TradingTransaction } from '@/types/ledger';
import { Transaction } from '@/types';

const supabase = createClient();

// ============================================
// LEDGERS
// ============================================

export async function fetchLedgers(): Promise<Ledger[]> {
    const { data, error } = await supabase
        .from('ledgers')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        assetType: row.asset_type,
        initialBalance: parseFloat(row.initial_balance) || 0,
        color: row.color,
        createdAt: row.created_at,
    }));
}

export async function createLedger(ledger: Omit<Ledger, 'id' | 'createdAt'>, userId: string): Promise<Ledger> {
    const { data, error } = await supabase
        .from('ledgers')
        .insert({
            user_id: userId,
            name: ledger.name,
            asset_type: ledger.assetType,
            initial_balance: ledger.initialBalance,
            color: ledger.color,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        assetType: data.asset_type,
        initialBalance: parseFloat(data.initial_balance) || 0,
        color: data.color,
        createdAt: data.created_at,
    };
}

export async function updateLedger(id: string, updates: Partial<Ledger>): Promise<void> {
    const { error } = await supabase
        .from('ledgers')
        .update({
            name: updates.name,
            asset_type: updates.assetType,
            initial_balance: updates.initialBalance,
            color: updates.color,
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteLedger(id: string): Promise<void> {
    const { error } = await supabase
        .from('ledgers')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============================================
// STRATEGIES
// ============================================

export async function fetchStrategies(): Promise<Strategy[]> {
    const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        color: row.color,
        createdAt: row.created_at,
    }));
}

export async function createStrategy(strategy: Omit<Strategy, 'id' | 'createdAt'>, userId: string): Promise<Strategy> {
    const { data, error } = await supabase
        .from('strategies')
        .insert({
            user_id: userId,
            name: strategy.name,
            description: strategy.description,
            color: strategy.color,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color,
        createdAt: data.created_at,
    };
}

export async function updateStrategy(id: string, updates: Partial<Strategy>): Promise<void> {
    const { error } = await supabase
        .from('strategies')
        .update({
            name: updates.name,
            description: updates.description,
            color: updates.color,
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteStrategy(id: string): Promise<void> {
    const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============================================
// TRANSACTIONS
// ============================================

export async function fetchTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => mapRowToTransaction(row));
}

export async function createTransaction(
    tx: Omit<Transaction, 'id' | 'createdAt'>,
    userId: string,
    ledgerId: string
): Promise<Transaction> {
    const tradingTx = tx as TradingTransaction;

    const { data, error } = await supabase
        .from('transactions')
        .insert({
            user_id: userId,
            ledger_id: ledgerId,
            strategy_id: tradingTx.strategyId || null,
            type: tx.type,
            ticker: tradingTx.ticker,
            symbol: tradingTx.symbol,
            entry_price: tradingTx.entryPrice,
            exit_price: tradingTx.exitPrice,
            quantity: tradingTx.quantity,
            amount: tx.amount,
            pnl: tradingTx.pnl,
            pnl_rate: tradingTx.pnlRate,
            commission: tradingTx.commission,
            date: tx.date,
            note: tx.note,
            images: tradingTx.images || [],
        })
        .select()
        .single();

    if (error) throw error;

    return mapRowToTransaction(data);
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    const tradingUpdates = updates as Partial<TradingTransaction>;

    const { error } = await supabase
        .from('transactions')
        .update({
            type: updates.type,
            ticker: tradingUpdates.ticker,
            symbol: tradingUpdates.symbol,
            entry_price: tradingUpdates.entryPrice,
            exit_price: tradingUpdates.exitPrice,
            quantity: tradingUpdates.quantity,
            amount: updates.amount,
            pnl: tradingUpdates.pnl,
            pnl_rate: tradingUpdates.pnlRate,
            commission: tradingUpdates.commission,
            date: updates.date,
            note: updates.note,
            images: tradingUpdates.images,
            strategy_id: tradingUpdates.strategyId,
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============================================
// HELPERS
// ============================================

function mapRowToTransaction(row: Record<string, unknown>): Transaction {
    const base = {
        id: row.id as string,
        type: row.type as 'income' | 'expense' | 'long' | 'short',
        amount: parseFloat(row.amount as string) || 0,
        date: row.date as string,
        note: row.note as string,
        createdAt: row.created_at as string,
    };

    // Check if it's a trading transaction
    if (row.type === 'long' || row.type === 'short' || row.pnl !== null) {
        return {
            ...base,
            ledgerId: row.ledger_id as string,
            strategyId: row.strategy_id as string | undefined,
            ticker: row.ticker as string,
            symbol: row.symbol as string,
            entryPrice: parseFloat(row.entry_price as string) || 0,
            exitPrice: parseFloat(row.exit_price as string) || 0,
            quantity: parseFloat(row.quantity as string) || 0,
            pnl: parseFloat(row.pnl as string) || 0,
            pnlRate: parseFloat(row.pnl_rate as string) || 0,
            commission: parseFloat(row.commission as string) || 0,
            images: (row.images as string[]) || [],
        } as TradingTransaction;
    }

    return base;
}

// ============================================
// BATCH OPERATIONS (for migration)
// ============================================

export async function batchCreateLedgers(ledgers: Ledger[], userId: string): Promise<void> {
    const rows = ledgers.map(ledger => ({
        id: ledger.id, // Keep original ID for reference
        user_id: userId,
        name: ledger.name,
        asset_type: ledger.assetType,
        initial_balance: ledger.initialBalance,
        color: ledger.color,
    }));

    const { error } = await supabase.from('ledgers').insert(rows);
    if (error) throw error;
}

export async function batchCreateStrategies(strategies: Strategy[], userId: string): Promise<void> {
    const rows = strategies.map(strategy => ({
        id: strategy.id, // Keep original ID for reference
        user_id: userId,
        name: strategy.name,
        description: strategy.description,
        color: strategy.color,
    }));

    const { error } = await supabase.from('strategies').insert(rows);
    if (error) throw error;
}

export async function batchCreateTransactions(
    transactions: Transaction[],
    userId: string,
    ledgerIdMap: Map<string, string> // Maps old ledger IDs to new ones
): Promise<void> {
    const rows = transactions.map(tx => {
        const tradingTx = tx as TradingTransaction;
        return {
            user_id: userId,
            ledger_id: ledgerIdMap.get(tradingTx.ledgerId || '') || null,
            strategy_id: tradingTx.strategyId || null,
            type: tx.type,
            ticker: tradingTx.ticker,
            symbol: tradingTx.symbol,
            entry_price: tradingTx.entryPrice,
            exit_price: tradingTx.exitPrice,
            quantity: tradingTx.quantity,
            amount: tx.amount,
            pnl: tradingTx.pnl,
            pnl_rate: tradingTx.pnlRate,
            commission: tradingTx.commission,
            date: tx.date,
            note: tx.note,
            images: tradingTx.images || [],
        };
    });

    // Batch insert in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const { error } = await supabase.from('transactions').insert(chunk);
        if (error) throw error;
    }
}
