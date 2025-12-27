import { AppData } from '@/types';
import { DEFAULT_CATEGORIES } from './constants';

/**
 * LocalStorage 的鍵名
 */
const STORAGE_KEY = 'expense-tracker-data';

/**
 * 預設資料結構
 */
const DEFAULT_DATA: AppData = {
    transactions: [],
    categories: DEFAULT_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: `default-${index}`,
    })),
    settings: {
        currency: 'NT$',
        locale: 'zh-TW',
    },
};

/**
 * 從 LocalStorage 讀取資料
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

        const parsed = JSON.parse(stored) as AppData;
        return {
            transactions: parsed.transactions || [],
            categories: parsed.categories || DEFAULT_DATA.categories,
            settings: {
                currency: parsed.settings?.currency || DEFAULT_DATA.settings.currency,
                locale: parsed.settings?.locale || DEFAULT_DATA.settings.locale,
            },
        };
    } catch (error) {
        console.error('Failed to load data from LocalStorage:', error);
        return DEFAULT_DATA;
    }
}

/**
 * 儲存資料到 LocalStorage
 */
export function saveToStorage(data: AppData): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
