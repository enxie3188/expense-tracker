'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Transaction, Category, FinancialStats } from '@/types';
import { Ledger, Strategy } from '@/types/ledger';
import { loadFromStorage, saveToStorage, clearStorage } from '@/lib/storage';
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
 * Finance Context 的回傳值介面
 */
export interface FinanceContextValue {
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
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;

    // 分類操作
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;

    // 帳本操作
    addLedger: (ledger: Omit<Ledger, 'id' | 'createdAt'>) => Promise<void>;
    updateLedger: (id: string, updates: Partial<Ledger>) => Promise<void>;
    deleteLedger: (id: string) => Promise<void>;
    switchLedger: (ledgerId: string) => void;

    // 策略操作
    addStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => Promise<void>;
    updateStrategy: (id: string, updates: Partial<Strategy>) => Promise<void>;
    deleteStrategy: (id: string) => Promise<void>;

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

// 創建 Context
const FinanceContext = createContext<FinanceContextValue | null>(null);

/**
 * Finance Provider Component
 */
export function FinanceProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const isLoggedIn = !!user;

    // 核心狀態
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [currentLedgerId, setCurrentLedgerId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 同步狀態
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isSyncing: false,
        lastSyncedAt: null,
        error: null,
        migrationNeeded: false,
    });

    // 初始載入資料
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                if (isLoggedIn && user) {
                    // 從雲端載入
                    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
                    const [cloudLedgers, cloudStrategies, cloudTransactions] = await Promise.all([
                        supabaseService.fetchLedgers(),
                        supabaseService.fetchStrategies(),
                        supabaseService.fetchTransactions(),
                    ]);
                    setLedgers(cloudLedgers);
                    setStrategies(cloudStrategies);
                    setTransactions(cloudTransactions);
                    setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
                } else {
                    // 從 localStorage 載入
                    const localData = loadFromStorage();
                    setTransactions(localData.transactions);
                    setCategories(localData.categories);
                    setLedgers(localData.ledgers || []);
                    setStrategies(localData.strategies || []);
                }
            } catch (error) {
                console.error('Failed to load data:', error);
                setSyncStatus(prev => ({
                    ...prev,
                    isSyncing: false,
                    error: error instanceof Error ? error.message : 'Failed to load',
                }));
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [isLoggedIn, user]);

    // 設定預設帳本
    useEffect(() => {
        if (ledgers.length > 0 && !currentLedgerId) {
            setCurrentLedgerId(ledgers[0].id);
        }
    }, [ledgers, currentLedgerId]);

    // 儲存到 localStorage（未登入時）
    useEffect(() => {
        if (!isLoggedIn && !isLoading) {
            saveToStorage({
                transactions,
                categories,
                ledgers,
                strategies,
                settings: { currency: 'NT$', locale: 'zh-TW' },
            });
        }
    }, [transactions, categories, ledgers, strategies, isLoggedIn, isLoading]);

    // 計算統計資料
    const stats = useMemo(() => calculateStats(transactions), [transactions]);

    // === 交易操作 ===
    const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
        const ledgerId = ('ledgerId' in transaction ? (transaction as any).ledgerId : undefined) || currentLedgerId;

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
                throw error;
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
    }, [isLoggedIn, user, currentLedgerId]);

    const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
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
                throw error;
            }
        } else {
            setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        }
    }, [isLoggedIn]);

    const deleteTransaction = useCallback(async (id: string) => {
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
                throw error;
            }
        } else {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    }, [isLoggedIn]);

    // === 分類操作 ===
    const addCategory = useCallback((category: Omit<Category, 'id'>) => {
        const newCategory: Category = { ...category, id: crypto.randomUUID() };
        setCategories(prev => [...prev, newCategory]);
    }, []);

    const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }, []);

    const deleteCategory = useCallback((id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id));
    }, []);

    // === 帳本操作 ===
    const addLedger = useCallback(async (ledger: Omit<Ledger, 'id' | 'createdAt'>) => {
        if (isLoggedIn && user) {
            setSyncStatus(prev => ({ ...prev, isSyncing: true }));
            try {
                const newLedger = await supabaseService.createLedger(ledger, user.id);
                setLedgers(prev => [...prev, newLedger]);
                setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
            } catch (error) {
                setSyncStatus(prev => ({
                    ...prev,
                    isSyncing: false,
                    error: error instanceof Error ? error.message : 'Failed to add ledger',
                }));
                throw error;
            }
        } else {
            const newLedger: Ledger = {
                ...ledger,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            setLedgers(prev => [...prev, newLedger]);
        }
    }, [isLoggedIn, user]);

    const updateLedger = useCallback(async (id: string, updates: Partial<Ledger>) => {
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
                throw error;
            }
        } else {
            setLedgers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
        }
    }, [isLoggedIn]);

    const deleteLedger = useCallback(async (id: string) => {
        if (isLoggedIn) {
            setSyncStatus(prev => ({ ...prev, isSyncing: true }));
            try {
                await supabaseService.deleteLedger(id);
                setLedgers(prev => prev.filter(l => l.id !== id));
                setTransactions(prev => prev.filter(t => t.ledgerId !== id));
                setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
            } catch (error) {
                setSyncStatus(prev => ({
                    ...prev,
                    isSyncing: false,
                    error: error instanceof Error ? error.message : 'Failed to delete ledger',
                }));
                throw error;
            }
        } else {
            setLedgers(prev => prev.filter(l => l.id !== id));
            setTransactions(prev => prev.filter(t => t.ledgerId !== id));
        }
    }, [isLoggedIn]);

    const switchLedger = useCallback((ledgerId: string) => {
        setCurrentLedgerId(ledgerId);
    }, []);

    // === 策略操作 ===
    const addStrategy = useCallback(async (strategy: Omit<Strategy, 'id' | 'createdAt'>) => {
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
                throw error;
            }
        } else {
            const newStrategy: Strategy = {
                ...strategy,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            setStrategies(prev => [...prev, newStrategy]);
        }
    }, [isLoggedIn, user]);

    const updateStrategy = useCallback(async (id: string, updates: Partial<Strategy>) => {
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
                throw error;
            }
        } else {
            setStrategies(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        }
    }, [isLoggedIn]);

    const deleteStrategy = useCallback(async (id: string) => {
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
                throw error;
            }
        } else {
            setStrategies(prev => prev.filter(s => s.id !== id));
        }
    }, [isLoggedIn]);

    // === 工具函式 ===
    const clearAllData = useCallback(() => {
        setTransactions([]);
        setCategories([]);
        setLedgers([]);
        setStrategies([]);
        if (!isLoggedIn) {
            clearStorage();
        }
    }, [isLoggedIn]);

    const clearTransactions = useCallback(() => {
        setTransactions([]);
    }, []);

    const importAllData = useCallback((data: {
        transactions?: Transaction[];
        ledgers?: Ledger[];
        strategies?: Strategy[];
        categories?: Category[];
    }) => {
        if (data.transactions) setTransactions(prev => [...prev, ...data.transactions!]);
        if (data.ledgers) setLedgers(prev => [...prev, ...data.ledgers!]);
        if (data.strategies) setStrategies(prev => [...prev, ...data.strategies!]);
        if (data.categories) setCategories(prev => [...prev, ...data.categories!]);
    }, []);

    const migrateToCloud = useCallback(async () => {
        // TODO: Implement migration logic
    }, []);

    const refreshFromCloud = useCallback(async () => {
        if (!isLoggedIn || !user) return;

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
            setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
        } catch (error) {
            setSyncStatus(prev => ({
                ...prev,
                isSyncing: false,
                error: error instanceof Error ? error.message : 'Failed to refresh',
            }));
        }
    }, [isLoggedIn, user]);

    const value: FinanceContextValue = {
        transactions,
        categories,
        ledgers,
        strategies,
        currentLedgerId,
        stats,
        isLoading,
        syncStatus,
        isLoggedIn,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addLedger,
        updateLedger,
        deleteLedger,
        switchLedger,
        addStrategy,
        updateStrategy,
        deleteStrategy,
        clearAllData,
        clearTransactions,
        importAllData,
        migrateToCloud,
        refreshFromCloud,
    };

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
}

/**
 * useFinance Hook - 使用 Context
 */
export function useFinance(): FinanceContextValue {
    const context = useContext(FinanceContext);
    if (!context) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
}
