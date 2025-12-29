'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, Category } from '@/types';
import { Ledger, Strategy } from '@/types/ledger';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import * as supabaseService from '@/lib/supabase-service';

export interface SyncStatus {
    isSyncing: boolean;
    lastSyncedAt: Date | null;
    error: string | null;
    migrationNeeded: boolean;
}

export interface CloudSyncReturn {
    // Data
    transactions: Transaction[];
    ledgers: Ledger[];
    strategies: Strategy[];
    categories: Category[];

    // Sync status
    syncStatus: SyncStatus;
    isLoggedIn: boolean;

    // Operations
    addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>, ledgerId: string) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;

    addLedger: (ledger: Omit<Ledger, 'id' | 'createdAt'>) => Promise<void>;
    updateLedger: (id: string, updates: Partial<Ledger>) => Promise<void>;
    deleteLedger: (id: string) => Promise<void>;

    addStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => Promise<void>;
    updateStrategy: (id: string, updates: Partial<Strategy>) => Promise<void>;
    deleteStrategy: (id: string) => Promise<void>;

    // Migration
    migrateLocalToCloud: () => Promise<void>;
    refreshFromCloud: () => Promise<void>;
}

export function useCloudSync(): CloudSyncReturn {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isSyncing: false,
        lastSyncedAt: null,
        error: null,
        migrationNeeded: false,
    });

    const isLoggedIn = !!user;

    // Load data on mount - either from cloud or local
    useEffect(() => {
        const loadData = async () => {
            setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

            try {
                if (isLoggedIn) {
                    // Load from Supabase
                    const [cloudLedgers, cloudStrategies, cloudTransactions] = await Promise.all([
                        supabaseService.fetchLedgers(),
                        supabaseService.fetchStrategies(),
                        supabaseService.fetchTransactions(),
                    ]);

                    // Check if cloud is empty but local has data (migration needed)
                    const localData = loadFromStorage();
                    const cloudIsEmpty = cloudLedgers.length === 0 && cloudTransactions.length === 0;
                    const localHasData = (localData.ledgers?.length || 0) > 0 || localData.transactions.length > 0;

                    if (cloudIsEmpty && localHasData) {
                        setSyncStatus(prev => ({ ...prev, migrationNeeded: true, isSyncing: false }));
                        // Load local data for now
                        setTransactions(localData.transactions);
                        setLedgers(localData.ledgers || []);
                        setStrategies(localData.strategies || []);
                        setCategories(localData.categories || []);
                    } else {
                        // Use cloud data
                        setTransactions(cloudTransactions);
                        setLedgers(cloudLedgers);
                        setStrategies(cloudStrategies);
                        setCategories(localData.categories || []); // Categories stay local for now

                        setSyncStatus(prev => ({
                            ...prev,
                            isSyncing: false,
                            lastSyncedAt: new Date(),
                            migrationNeeded: false,
                        }));
                    }
                } else {
                    // Load from localStorage
                    const data = loadFromStorage();
                    setTransactions(data.transactions);
                    setLedgers(data.ledgers || []);
                    setStrategies(data.strategies || []);
                    setCategories(data.categories || []);
                    setSyncStatus(prev => ({ ...prev, isSyncing: false }));
                }
            } catch (error) {
                console.error('Failed to load data:', error);
                setSyncStatus(prev => ({
                    ...prev,
                    isSyncing: false,
                    error: error instanceof Error ? error.message : 'Failed to sync',
                }));

                // Fallback to local data
                const data = loadFromStorage();
                setTransactions(data.transactions);
                setLedgers(data.ledgers || []);
                setStrategies(data.strategies || []);
                setCategories(data.categories || []);
            }
        };

        loadData();
    }, [isLoggedIn]);

    // Save to localStorage whenever data changes (backup)
    useEffect(() => {
        saveToStorage({ transactions, categories, ledgers, strategies });
    }, [transactions, categories, ledgers, strategies]);

    // ============================================
    // TRANSACTION OPERATIONS
    // ============================================

    const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'createdAt'>, ledgerId: string) => {
        if (isLoggedIn && user) {
            setSyncStatus(prev => ({ ...prev, isSyncing: true }));
            try {
                const newTx = await supabaseService.createTransaction(tx, user.id, ledgerId);
                setTransactions(prev => [newTx, ...prev]);
                setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
            } catch (error) {
                setSyncStatus(prev => ({
                    ...prev,
                    isSyncing: false,
                    error: error instanceof Error ? error.message : 'Failed to add transaction',
                }));
                throw error;
            }
        } else {
            // Local only
            const newTx: Transaction = {
                ...tx,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            setTransactions(prev => [newTx, ...prev]);
        }
    }, [isLoggedIn, user]);

    const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
        if (isLoggedIn) {
            setSyncStatus(prev => ({ ...prev, isSyncing: true }));
            try {
                await supabaseService.updateTransaction(id, updates);
                setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
                setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
            } catch (error) {
                setSyncStatus(prev => ({
                    ...prev,
                    isSyncing: false,
                    error: error instanceof Error ? error.message : 'Failed to update transaction',
                }));
                throw error;
            }
        } else {
            setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
        }
    }, [isLoggedIn]);

    const deleteTransaction = useCallback(async (id: string) => {
        if (isLoggedIn) {
            setSyncStatus(prev => ({ ...prev, isSyncing: true }));
            try {
                await supabaseService.deleteTransaction(id);
                setTransactions(prev => prev.filter(tx => tx.id !== id));
                setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
            } catch (error) {
                setSyncStatus(prev => ({
                    ...prev,
                    isSyncing: false,
                    error: error instanceof Error ? error.message : 'Failed to delete transaction',
                }));
                throw error;
            }
        } else {
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        }
    }, [isLoggedIn]);

    // ============================================
    // LEDGER OPERATIONS
    // ============================================

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
                setTransactions(prev => prev.filter(tx => {
                    const tradingTx = tx as { ledgerId?: string };
                    return tradingTx.ledgerId !== id;
                }));
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
        }
    }, [isLoggedIn]);

    // ============================================
    // STRATEGY OPERATIONS
    // ============================================

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

    // ============================================
    // MIGRATION & REFRESH
    // ============================================

    const migrateLocalToCloud = useCallback(async () => {
        if (!isLoggedIn || !user) {
            throw new Error('Must be logged in to migrate');
        }

        setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

        try {
            const localData = loadFromStorage();

            // Create ledger ID mapping (old -> new)
            const ledgerIdMap = new Map<string, string>();

            // 1. Migrate ledgers
            if (localData.ledgers && localData.ledgers.length > 0) {
                for (const ledger of localData.ledgers) {
                    const newLedger = await supabaseService.createLedger({
                        name: ledger.name,
                        assetType: ledger.assetType,
                        initialBalance: ledger.initialBalance,
                        color: ledger.color,
                    }, user.id);
                    ledgerIdMap.set(ledger.id, newLedger.id);
                }
            }

            // 2. Migrate strategies
            if (localData.strategies && localData.strategies.length > 0) {
                for (const strategy of localData.strategies) {
                    await supabaseService.createStrategy({
                        name: strategy.name,
                        description: strategy.description,
                        color: strategy.color,
                    }, user.id);
                }
            }

            // 3. Migrate transactions (with updated ledger IDs)
            if (localData.transactions.length > 0) {
                for (const tx of localData.transactions) {
                    const tradingTx = tx as { ledgerId?: string };
                    const newLedgerId = ledgerIdMap.get(tradingTx.ledgerId || '') ||
                        (ledgerIdMap.values().next().value as string);

                    if (newLedgerId) {
                        await supabaseService.createTransaction(tx, user.id, newLedgerId);
                    }
                }
            }

            // 4. Refresh from cloud
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
    }, [isLoggedIn]);

    return {
        transactions,
        ledgers,
        strategies,
        categories,
        syncStatus,
        isLoggedIn,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addLedger,
        updateLedger,
        deleteLedger,
        addStrategy,
        updateStrategy,
        deleteStrategy,
        migrateLocalToCloud,
        refreshFromCloud,
    };
}
