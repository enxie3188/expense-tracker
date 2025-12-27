'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, Category, FinancialStats } from '@/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { calculateStats } from '@/lib/calculations';

/**
 * useFinance Hook 的回傳值介面
 */
export interface UseFinanceReturn {
    // 資料狀態
    transactions: Transaction[];
    categories: Category[];
    stats: FinancialStats;
    isLoading: boolean;

    // 交易操作
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;

    // 分類操作
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;

    // 工具函式
    clearAllData: () => void;
}

/**
 * 核心財務管理 Hook
 * 
 * 功能：
 * - 從 LocalStorage 讀取與儲存資料
 * - 提供交易和分類的 CRUD 操作
 * - 自動計算總收入、總支出和餘額
 * 
 * @returns UseFinanceReturn 物件
 */
export function useFinance(): UseFinanceReturn {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 初始化：從 LocalStorage 載入資料
    useEffect(() => {
        const data = loadFromStorage();
        setTransactions(data.transactions);
        setCategories(data.categories);
        setIsLoading(false);
    }, []);

    // 當資料變更時，自動儲存到 LocalStorage
    useEffect(() => {
        if (!isLoading) {
            saveToStorage({ transactions, categories });
        }
    }, [transactions, categories, isLoading]);

    // 計算統計資料
    const stats = calculateStats(transactions);

    // === 交易操作 ===

    /**
     * 新增交易記錄
     */
    const addTransaction = useCallback(
        (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
            const newTransaction: Transaction = {
                ...transaction,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            setTransactions((prev) => [...prev, newTransaction]);
        },
        []
    );

    /**
     * 更新交易記錄
     */
    const updateTransaction = useCallback(
        (id: string, updates: Partial<Transaction>) => {
            setTransactions((prev) =>
                prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
            );
        },
        []
    );

    /**
     * 刪除交易記錄
     */
    const deleteTransaction = useCallback((id: string) => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // === 分類操作 ===

    /**
     * 新增分類
     */
    const addCategory = useCallback((category: Omit<Category, 'id'>) => {
        const newCategory: Category = {
            ...category,
            id: crypto.randomUUID(),
        };
        setCategories((prev) => [...prev, newCategory]);
    }, []);

    /**
     * 更新分類
     */
    const updateCategory = useCallback(
        (id: string, updates: Partial<Category>) => {
            setCategories((prev) =>
                prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
            );
        },
        []
    );

    /**
     * 刪除分類
     */
    const deleteCategory = useCallback((id: string) => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
    }, []);

    // === 工具函式 ===

    /**
     * 清除所有資料
     */
    const clearAllData = useCallback(() => {
        setTransactions([]);
        setCategories([]);
    }, []);

    return {
        // 資料狀態
        transactions,
        categories,
        stats,
        isLoading,

        // 交易操作
        addTransaction,
        updateTransaction,
        deleteTransaction,

        // 分類操作
        addCategory,
        updateCategory,
        deleteCategory,

        // 工具函式
        clearAllData,
    };
}
