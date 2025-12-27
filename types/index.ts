/**
 * 交易類型：收入或支出
 */
export type TransactionType = 'income' | 'expense';

/**
 * 交易記錄
 */
export interface Transaction {
    id: string;              // UUID
    type: TransactionType;   // 收入或支出
    amount: number;          // 金額（以分為單位，避免浮點數問題）
    category: string;        // 分類 ID
    date: string;            // ISO 8601 格式
    note?: string;           // 備註
    createdAt: string;       // 建立時間
}

/**
 * 分類
 */
export interface Category {
    id: string;
    name: string;            // 分類名稱
    type: 'income' | 'expense' | 'both';
    icon: string;            // Lucide icon 名稱
    color: string;           // Tailwind color class
    isDefault: boolean;      // 是否為預設分類
}

/**
 * LocalStorage 儲存格式
 */
export interface AppData {
    transactions: Transaction[];
    categories: Category[];
    settings: {
        currency: string;      // 貨幣符號
        locale: string;        // 地區設定
    };
}

/**
 * 財務統計資料
 */
export interface FinancialStats {
    totalIncome: number;     // 總收入
    totalExpense: number;    // 總支出
    balance: number;         // 餘額
}
