'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, Category, FinancialStats } from '@/types';
import { Ledger, Strategy, TradingTransaction } from '@/types/ledger';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { calculateStats } from '@/lib/calculations';
import { useAuth } from '@/contexts/AuthContext';
import * as supabaseService from '@/lib/supabase-service';

/**
 * Sync Status Interface
 */
export interface SyncStatus {
    isSyncing: boolean;
    lastSyncedAt: Date | null;
    error: string | null;
    migrationNeeded: boolean;
}

/**
 * useFinance Hook 的回傳值介面（雲端同步版）
 */
export interface UseFinanceReturn {
    // 資料狀態
    transactions: Transaction[];
    categories: Category[];
    ledgers: Ledger[];
    strategies: Strategy[];
    currentLedgerId: string | null;
    stats: FinancialStats;
    isLoading: boolean;

    // 雲端同步狀態
    syncStatus: SyncStatus;
    isLoggedIn: boolean;

    // 交易操作
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;

    // 分類操作
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;

    // 帳本操作
    addLedger: (ledger: Omit<Ledger, 'id' | 'createdAt'>) => void;
    updateLedger: (id: string, updates: Partial<Ledger>) => void;
    deleteLedger: (id: string) => void;
    switchLedger: (ledgerId: string) => void;

    // 策略操作
    addStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => void;
    updateStrategy: (id: string, updates: Partial<Strategy>) => void;
    deleteStrategy: (id: string) => void;

    // 工具函式
    clearAllData: () => void;
    clearTransactions: () => void;
    importAllData: (data: {
        transactions?: Transaction[];
        ledgers?: Ledger[];
        strategies?: Strategy[];
        categories?: Category[];
    }) => void;

    // 雲端同步函式
    migrateToCloud: () => Promise<void>;
    refreshFromCloud: () => Promise<void>;
}

/**
 * 核心財務管理 Hook（雲端同步版）
 * 
 * 功能：
 * - 登入後自動從 Supabase 載入資料
 * - 未登入時使用 localStorage
 * - CRUD 操作自動同步到雲端
 * - 支援本地資料遷移到雲端
 * 
 * @returns UseFinanceReturn 物件
 */
export function useFinance(): UseFinanceReturn {
    const { user } = useAuth();
    const isLoggedIn = !!user;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [currentLedgerId, setCurrentLedgerId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isSyncing: false,
        lastSyncedAt: null,
        error: null,
        migrationNeeded: false,
    });

    // 初始化：根據登入狀態載入資料
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

            try {
                if (isLoggedIn) {
                    // 從 Supabase 載入
                    const [cloudLedgers, cloudStrategies, cloudTransactions] = await Promise.all([
                        supabaseService.fetchLedgers(),
                        supabaseService.fetchStrategies(),
                        supabaseService.fetchTransactions(),
                    ]);

                    // 檢查是否需要遷移（雲端空但本地有資料）
                    const localData = loadFromStorage();
                    const cloudIsEmpty = cloudLedgers.length === 0 && cloudTransactions.length === 0;
                    const localHasData = (localData.ledgers?.length || 0) > 0 || localData.transactions.length > 0;

                    if (cloudIsEmpty && localHasData && user) {
                        // 自動遷移本地資料到雲端
                        console.log('Auto-migrating local data to cloud...');

                        try {
                            // 遷移帳本
                            const ledgerIdMap = new Map<string, string>();
                            if (localData.ledgers && localData.ledgers.length > 0) {
                                for (const ledger of localData.ledgers) {
                                    const newLedger = await supabaseService.createLedger({
                                        name: ledger.name,
                                        assetType: ledger.assetType,
                                        initialBalance: ledger.initialBalance || 0,
                                        icon: ledger.icon || '📊',
                                        color: ledger.color,
                                    }, user.id);
                                    ledgerIdMap.set(ledger.id, newLedger.id);
                                }
                            }

                            // 遷移策略
                            const strategyIdMap = new Map<string, string>();
                            if (localData.strategies && localData.strategies.length > 0) {
                                for (const strategy of localData.strategies) {
                                    const newStrategy = await supabaseService.createStrategy({
                                        name: strategy.name,
                                        description: strategy.description,
                                        color: strategy.color,
                                    }, user.id);
                                    strategyIdMap.set(strategy.id, newStrategy.id);
                                }
                            }

                            // 遷移交易記錄
                            if (localData.transactions.length > 0) {
                                await supabaseService.batchCreateTransactions(
                                    localData.transactions,
                                    user.id,
                                    ledgerIdMap
                                );
                            }

                            // 重新從雲端載入
                            const [newLedgers, newStrategies, newTransactions] = await Promise.all([
                                supabaseService.fetchLedgers(),
                                supabaseService.fetchStrategies(),
                                supabaseService.fetchTransactions(),
                            ]);

                            setLedgers(newLedgers);
                            setStrategies(newStrategies);
                            setTransactions(newTransactions);
                            setCategories(localData.categories || []);

                            if (newLedgers.length > 0) {
                                setCurrentLedgerId(newLedgers[0].id);
                            }

                            console.log('Auto-migration completed!');
                            setSyncStatus(prev => ({
                                ...prev,
                                isSyncing: false,
                                lastSyncedAt: new Date(),
                                migrationNeeded: false,
                            }));
                        } catch (migrationError) {
                            console.error('Auto-migration failed:', migrationError);
                            // 回退到顯示本地資料
                            setTransactions(localData.transactions);
                            setLedgers(localData.ledgers || []);
                            setStrategies(localData.strategies || []);
                            setCategories(localData.categories || []);
                            if (localData.ledgers && localData.ledgers.length > 0) {
                                setCurrentLedgerId(localData.ledgers[0].id);
                            }
                            setSyncStatus(prev => ({
                                ...prev,
                                migrationNeeded: true,
                                isSyncing: false,
                                error: 'Auto-migration failed. Please try manual migration.'
                            }));
                        }
                    } else {
                        // 使用雲端資料
                        setTransactions(cloudTransactions);
                        setLedgers(cloudLedgers);
                        setStrategies(cloudStrategies);
                        setCategories(localData.categories || []);
                        if (cloudLedgers.length > 0) {
                            setCurrentLedgerId(cloudLedgers[0].id);
                        }
                        setSyncStatus(prev => ({
                            ...prev,
                            isSyncing: false,
                            lastSyncedAt: new Date(),
                            migrationNeeded: false,
                        }));
                    }
                } else {
                    // 從 localStorage 載入
                    const data = loadFromStorage();
                    setTransactions(data.transactions);
                    setCategories(data.categories || []);
                    setLedgers(data.ledgers || []);
                    setStrategies(data.strategies || []);
                    if (data.ledgers && data.ledgers.length > 0) {
                        setCurrentLedgerId(data.ledgers[0].id);
                    }
                    setSyncStatus(prev => ({ ...prev, isSyncing: false }));
                }
            } catch (error) {
                console.error('Failed to load data:', error);
                setSyncStatus(prev => ({
                    ...prev,
                    isSyncing: false,
                    error: error instanceof Error ? error.message : 'Failed to sync',
                }));
                // 回退到本地資料
                const data = loadFromStorage();
                setTransactions(data.transactions);
                setCategories(data.categories || []);
                setLedgers(data.ledgers || []);
                setStrategies(data.strategies || []);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [isLoggedIn, user?.id]);

    // 當資料變更時，自動儲存到 localStorage（作為備份）
    useEffect(() => {
        if (!isLoading) {
            saveToStorage({ transactions, categories, ledgers, strategies });
        }
    }, [transactions, categories, ledgers, strategies, isLoading]);

    // 計算統計資料
    const stats = useMemo(() => {
        return calculateStats(
            currentLedgerId
                ? transactions.filter((t) => 'ledgerId' in t && t.ledgerId === currentLedgerId)
                : transactions
        );
    }, [transactions, currentLedgerId]);

    // === 交易操作 ===

    const addTransaction = useCallback(
        async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
            const ledgerId = ('ledgerId' in transaction ? transaction.ledgerId : undefined) || currentLedgerId;

            if (isLoggedIn && user && ledgerId) {
                setSyncStatus(prev => ({ ...prev, isSyncing: true }));
                try {
                    const newTx = await supabaseService.createTransaction(transaction, user.id, ledgerId);
                    setTransactions(prev => [newTx, ...prev]);
                    setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
                } catch (error) {
                    setSyncStatus(prev => ({
                        ...prev,
                        isSyncing: false,
                        error: error instanceof Error ? error.message : 'Failed to add',
                    }));
                }
            } else {
                const newTransaction: Transaction = {
                    ...transaction,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    ledgerId: ledgerId || undefined,
                } as Transaction;
                setTransactions(prev => [newTransaction, ...prev]);
            }
        },
        [isLoggedIn, user, currentLedgerId]
    );

    const updateTransaction = useCallback(
        async (id: string, updates: Partial<Transaction>) => {
            if (isLoggedIn) {
                setSyncStatus(prev => ({ ...prev, isSyncing: true }));
                try {
                    await supabaseService.updateTransaction(id, updates);
                    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
                    setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
                } catch (error) {
                    setSyncStatus(prev => ({
                        ...prev,
                        isSyncing: false,
                        error: error instanceof Error ? error.message : 'Failed to update',
                    }));
                }
            } else {
                setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
            }
        },
        [isLoggedIn]
    );

    const deleteTransaction = useCallback(
        async (id: string) => {
            if (isLoggedIn) {
                setSyncStatus(prev => ({ ...prev, isSyncing: true }));
                try {
                    await supabaseService.deleteTransaction(id);
                    setTransactions(prev => prev.filter(t => t.id !== id));
                    setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
                } catch (error) {
                    setSyncStatus(prev => ({
                        ...prev,
                        isSyncing: false,
                        error: error instanceof Error ? error.message : 'Failed to delete',
                    }));
                }
            } else {
                setTransactions(prev => prev.filter(t => t.id !== id));
            }
        },
        [isLoggedIn]
    );

    // === 分類操作 (保持本地) ===

    const addCategory = useCallback((category: Omit<Category, 'id'>) => {
        const newCategory: Category = {
            ...category,
            id: crypto.randomUUID(),
        };
        setCategories(prev => [...prev, newCategory]);
    }, []);

    const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }, []);

    const deleteCategory = useCallback((id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id));
    }, []);

    // === 帳本操作 ===

    const addLedger = useCallback(
        async (ledger: Omit<Ledger, 'id' | 'createdAt'>) => {
            if (isLoggedIn && user) {
                setSyncStatus(prev => ({ ...prev, isSyncing: true }));
                try {
                    const newLedger = await supabaseService.createLedger(ledger, user.id);
                    setLedgers(prev => [...prev, newLedger]);
                    if (ledgers.length === 0) {
                        setCurrentLedgerId(newLedger.id);
                    }
                    setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
                } catch (error) {
                    setSyncStatus(prev => ({
                        ...prev,
                        isSyncing: false,
                        error: error instanceof Error ? error.message : 'Failed to add ledger',
                    }));
                }
            } else {
                const newLedger: Ledger = {
                    ...ledger,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                };
                setLedgers(prev => [...prev, newLedger]);
                if (ledgers.length === 0) {
                    setCurrentLedgerId(newLedger.id);
                }
            }
        },
        [isLoggedIn, user, ledgers.length]
    );

    const updateLedger = useCallback(
        async (id: string, updates: Partial<Ledger>) => {
            if (isLoggedIn) {
                setSyncStatus(prev => ({ ...prev, isSyncing: true }));
                try {
                    await supabaseService.updateLedger(id, updates);
                    setLedgers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
                    setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
                } catch (error) {
                    setSyncStatus(prev => ({
                        ...prev,
                        isSyncing: false,
                        error: error instanceof Error ? error.message : 'Failed to update ledger',
                    }));
                }
            } else {
                setLedgers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
            }
        },
        [isLoggedIn]
    );

    const deleteLedger = useCallback(
        async (id: string) => {
            if (isLoggedIn) {
                setSyncStatus(prev => ({ ...prev, isSyncing: true }));
                try {
                    await supabaseService.deleteLedger(id);
                    setLedgers(prev => prev.filter(l => l.id !== id));
                    setTransactions(prev => prev.filter(t => !('ledgerId' in t) || t.ledgerId !== id));
                    setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
                } catch (error) {
                    setSyncStatus(prev => ({
                        ...prev,
                        isSyncing: false,
                        error: error instanceof Error ? error.message : 'Failed to delete ledger',
                    }));
                }
            } else {
                setLedgers(prev => prev.filter(l => l.id !== id));
            }
        },
        [isLoggedIn]
    );

    const switchLedger = useCallback((ledgerId: string) => {
        setCurrentLedgerId(ledgerId);
    }, []);

    // === 策略操作 ===

    const addStrategy = useCallback(
        async (strategy: Omit<Strategy, 'id' | 'createdAt'>) => {
            if (isLoggedIn && user) {
                setSyncStatus(prev => ({ ...prev, isSyncing: true }));
                try {
                    const newStrategy = await supabaseService.createStrategy(strategy, user.id);
                    setStrategies(prev => [...prev, newStrategy]);
                    setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
                } catch (error) {
                    setSyncStatus(prev => ({
                        ...prev,
                        isSyncing: false,
                        error: error instanceof Error ? error.message : 'Failed to add strategy',
                    }));
                }
            } else {
                const newStrategy: Strategy = {
                    ...strategy,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                };
                setStrategies(prev => [...prev, newStrategy]);
            }
        },
        [isLoggedIn, user]
    );

    const updateStrategy = useCallback(
        async (id: string, updates: Partial<Strategy>) => {
            if (isLoggedIn) {
                setSyncStatus(prev => ({ ...prev, isSyncing: true }));
                try {
                    await supabaseService.updateStrategy(id, updates);
                    setStrategies(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
                    setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
                } catch (error) {
                    setSyncStatus(prev => ({
                        ...prev,
                        isSyncing: false,
                        error: error instanceof Error ? error.message : 'Failed to update strategy',
                    }));
                }
            } else {
                setStrategies(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
            }
        },
        [isLoggedIn]
    );

    const deleteStrategy = useCallback(
        async (id: string) => {
            if (isLoggedIn) {
                setSyncStatus(prev => ({ ...prev, isSyncing: true }));
                try {
                    await supabaseService.deleteStrategy(id);
                    setStrategies(prev => prev.filter(s => s.id !== id));
                    setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
                } catch (error) {
                    setSyncStatus(prev => ({
                        ...prev,
                        isSyncing: false,
                        error: error instanceof Error ? error.message : 'Failed to delete strategy',
                    }));
                }
            } else {
                setStrategies(prev => prev.filter(s => s.id !== id));
            }
        },
        [isLoggedIn]
    );

    // === 工具函式 ===

    const clearAllData = useCallback(() => {
        setTransactions([]);
        setCategories([]);
        setLedgers([]);
        setStrategies([]);
        setCurrentLedgerId(null);
        localStorage.removeItem('financeData');
    }, []);

    const clearTransactions = useCallback(() => {
        setTransactions([]);
    }, []);

    const importAllData = useCallback((data: {
        transactions?: Transaction[];
        ledgers?: Ledger[];
        strategies?: Strategy[];
        categories?: Category[];
    }) => {
        if (data.transactions) setTransactions(data.transactions);
        if (data.ledgers) {
            setLedgers(data.ledgers);
            if (data.ledgers.length > 0 && !currentLedgerId) {
                setCurrentLedgerId(data.ledgers[0].id);
            }
        }
        if (data.strategies) setStrategies(data.strategies);
        if (data.categories) setCategories(data.categories);
    }, [currentLedgerId]);

    // === 雲端同步函式 ===

    const migrateToCloud = useCallback(async () => {
        if (!isLoggedIn || !user) {
            throw new Error('Must be logged in to migrate');
        }

        setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

        try {
            const localData = loadFromStorage();
            const ledgerIdMap = new Map<string, string>();

            // 1. 遷移帳本
            if (localData.ledgers && localData.ledgers.length > 0) {
                for (const ledger of localData.ledgers) {
                    const newLedger = await supabaseService.createLedger({
                        name: ledger.name,
                        assetType: ledger.assetType,
                        initialBalance: ledger.initialBalance,
                        icon: ledger.icon || '📊',
                        color: ledger.color,
                    }, user.id);
                    ledgerIdMap.set(ledger.id, newLedger.id);
                }
            }

            // 2. 遷移策略
            if (localData.strategies && localData.strategies.length > 0) {
                for (const strategy of localData.strategies) {
                    await supabaseService.createStrategy({
                        name: strategy.name,
                        description: strategy.description,
                        color: strategy.color,
                    }, user.id);
                }
            }

            // 3. 遷移交易
            if (localData.transactions.length > 0) {
                for (const tx of localData.transactions) {
                    const txLedgerId = 'ledgerId' in tx ? tx.ledgerId : undefined;
                    const newLedgerId = ledgerIdMap.get(txLedgerId || '') ||
                        (ledgerIdMap.values().next().value as string);

                    if (newLedgerId) {
                        await supabaseService.createTransaction(tx, user.id, newLedgerId);
                    }
                }
            }

            // 4. 重新從雲端載入
            await refreshFromCloud();

            setSyncStatus(prev => ({
                ...prev,
                isSyncing: false,
                migrationNeeded: false,
                lastSyncedAt: new Date(),
            }));
        } catch (error) {
            console.error('Migration failed:', error);
            setSyncStatus(prev => ({
                ...prev,
                isSyncing: false,
                error: error instanceof Error ? error.message : 'Migration failed',
            }));
            throw error;
        }
    }, [isLoggedIn, user]);

    const refreshFromCloud = useCallback(async () => {
        if (!isLoggedIn) return;

        setSyncStatus(prev => ({ ...prev, isSyncing: true }));

        try {
            const [cloudLedgers, cloudStrategies, cloudTransactions] = await Promise.all([
                supabaseService.fetchLedgers(),
                supabaseService.fetchStrategies(),
                supabaseService.fetchTransactions(),
            ]);

            setLedgers(cloudLedgers);
            setStrategies(cloudStrategies);
            setTransactions(cloudTransactions);

            if (cloudLedgers.length > 0 && !currentLedgerId) {
                setCurrentLedgerId(cloudLedgers[0].id);
            }

            setSyncStatus(prev => ({
                ...prev,
                isSyncing: false,
                lastSyncedAt: new Date(),
            }));
        } catch (error) {
            setSyncStatus(prev => ({
                ...prev,
                isSyncing: false,
                error: error instanceof Error ? error.message : 'Failed to refresh',
            }));
        }
    }, [isLoggedIn, currentLedgerId]);

    return {
        // 資料狀態
        transactions,
        categories,
        ledgers,
        strategies,
        currentLedgerId,
        stats,
        isLoading,

        // 雲端同步狀態
        syncStatus,
        isLoggedIn,

        // 交易操作
        addTransaction,
        updateTransaction,
        deleteTransaction,

        // 分類操作
        addCategory,
        updateCategory,
        deleteCategory,

        // 帳本操作
        addLedger,
        updateLedger,
        deleteLedger,
        switchLedger,

        // 策略操作
        addStrategy,
        updateStrategy,
        deleteStrategy,

        // 工具函式
        clearAllData,
        clearTransactions,
        importAllData,

        // 雲端同步函式
        migrateToCloud,
        refreshFromCloud,
    };
}
