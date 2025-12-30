import { AppData } from '@/types';
import { Ledger, Strategy } from '@/types/ledger';
import { DEFAULT_CATEGORIES } from './constants';
import { createLedger } from './ledgerManager';

/**
 * LocalStorage 的鍵名
 */
const STORAGE_KEY = 'expense-tracker-data';

/**
 * 預設資料結構（更新版）
 */
const DEFAULT_DATA: AppData = {
    transactions: [],
    categories: DEFAULT_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: `default-${index}`,
    })),
    ledgers: [], // 新用戶不自動創建帳本
    strategies: [],
    settings: {
        currency: 'NT$',
        locale: 'zh-TW',
    },
};

/**
 * 從 LocalStorage 讀取資料（含自動遷移）
 */
export function loadFromStorage(): AppData {
    if (typeof window === 'undefined') {
        return DEFAULT_DATA;
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return DEFAULT_DATA;
        }

        const parsed = JSON.parse(stored) as Partial<AppData>;

        // 自動遷移邏輯
        const migrated = migrateData(parsed);

        return {
            transactions: migrated.transactions || [],
            categories: migrated.categories || DEFAULT_DATA.categories,
            ledgers: migrated.ledgers || DEFAULT_DATA.ledgers,
            strategies: migrated.strategies || [],
            settings: {
                currency: migrated.settings?.currency || DEFAULT_DATA.settings.currency,
                locale: migrated.settings?.locale || DEFAULT_DATA.settings.locale,
            },
        };
    } catch (error) {
        console.error('Failed to load data from LocalStorage:', error);
        return DEFAULT_DATA;
    }
}

/**
 * 遷移舊資料格式至新 schema
 */
function migrateData(data: Partial<AppData>): AppData {
    // 檢查是否為舊格式（沒有 ledgers 欄位但有交易記錄）
    const hasOldTransactions = (data.transactions || []).length > 0;
    const hasNoLedgers = !data.ledgers || data.ledgers.length === 0;

    if (hasNoLedgers && hasOldTransactions) {
        console.log('Migrating old data format with transactions to new schema...');

        // 只在有舊交易時才建立預設帳本
        const defaultLedger = createLedger('我的帳本', 'other', 0, '📊', '#3B82F6');

        // 將所有舊交易歸屬至預設帳本
        const migratedTransactions = (data.transactions || []).map((tx) => ({
            ...tx,
            ledgerId: defaultLedger.id,
        }));

        return {
            transactions: migratedTransactions,
            categories: data.categories || DEFAULT_DATA.categories,
            ledgers: [defaultLedger],
            strategies: [],
            settings: data.settings || DEFAULT_DATA.settings,
        };
    }

    // 新用戶或已是新格式，直接返回
    return {
        transactions: data.transactions || [],
        categories: data.categories || DEFAULT_DATA.categories,
        ledgers: data.ledgers || [],
        strategies: data.strategies || [],
        settings: data.settings || DEFAULT_DATA.settings,
    };
}

/**
 * 儲存資料到 LocalStorage
 */
export function saveToStorage(data: AppData | Partial<AppData>): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        // 確保有必要的欄位
        const dataToSave: AppData = {
            transactions: data.transactions || [],
            categories: data.categories || DEFAULT_DATA.categories,
            ledgers: data.ledgers || DEFAULT_DATA.ledgers,
            strategies: data.strategies || [],
            settings: data.settings || DEFAULT_DATA.settings,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
        console.error('Failed to save data to LocalStorage:', error);
    }
}

/**
 * 清除 LocalStorage 資料
 */
export function clearStorage(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear LocalStorage:', error);
    }
}
