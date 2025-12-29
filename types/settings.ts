// Settings Types
export interface AppearanceSettings {
    theme: 'dark' | 'light' | 'auto';
    language: 'zh-TW' | 'zh-CN' | 'en';
    fontSize: 'small' | 'medium' | 'large';
    accentColor: string;
    dateFormat: 'yyyy/MM/dd' | 'dd/MM/yyyy' | 'MM/dd/yyyy';
    timeFormat: '12h' | '24h';
    timezone: string;
}

export interface LedgerSettings {
    defaultLedgerId: string | null;
    sortOrder: 'manual' | 'date' | 'tradeCount';
    archiveInactive: boolean;
    showInitialBalanceReminder: boolean;
    defaultPnLDisplay: 'absolute' | 'percentage' | 'both';
    autoSwitchLedger: boolean;
}

export interface TransactionSettings {
    defaultCurrency: 'TWD' | 'USD' | 'CNY' | 'EUR' | 'JPY';
    decimalPlaces: number;
    autoDeductCommission: boolean;
    defaultCommissionRate: number;
    cardDefaultState: 'expanded' | 'collapsed';
    noteCharacterLimit: number;
    quickTemplates: TransactionTemplate[];
    defaultSort: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
    itemsPerPage: number;
    showFilters: boolean;
}

export interface TransactionTemplate {
    id: string;
    name: string;
    type: 'long' | 'short';
    ticker?: string;
    quantity?: number;
    commission?: number;
}

export interface ChartSettings {
    defaultTimeRange: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
    chartType: 'line' | 'candlestick';
    visibleStats: {
        totalPnL: boolean;
        winRate: boolean;
        sharpeRatio: boolean;
        maxDrawdown: boolean;
        avgWin: boolean;
        avgLoss: boolean;
    };
    dataPrecision: number;
    percentagePrecision: number;
}

export interface DataManagementSettings {
    exportFormat: 'csv' | 'json' | 'excel';
    exportRange: 'all' | 'ledger' | 'dateRange';
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly';
}

export interface NotificationSettings {
    dailyReminder: boolean;
    unrecordedAlert: boolean;
    goalAchievement: boolean;
    soundEffects: boolean;
}

export interface Settings {
    appearance: AppearanceSettings;
    ledger: LedgerSettings;
    transaction: TransactionSettings;
    chart: ChartSettings;
    dataManagement: DataManagementSettings;
    notification: NotificationSettings;
}

// Default settings
export const DEFAULT_SETTINGS: Settings = {
    appearance: {
        theme: 'dark',
        language: 'zh-TW',
        fontSize: 'medium',
        accentColor: '#00d9ff',
        dateFormat: 'yyyy/MM/dd',
        timeFormat: '24h',
        timezone: 'Asia/Taipei',
    },
    ledger: {
        defaultLedgerId: null,
        sortOrder: 'manual',
        archiveInactive: false,
        showInitialBalanceReminder: true,
        defaultPnLDisplay: 'both',
        autoSwitchLedger: false,
    },
    transaction: {
        defaultCurrency: 'TWD',
        decimalPlaces: 0,
        autoDeductCommission: true,
        defaultCommissionRate: 0.1425,
        cardDefaultState: 'collapsed',
        noteCharacterLimit: 500,
        quickTemplates: [],
        defaultSort: 'date-desc',
        itemsPerPage: 20,
        showFilters: false,
    },
    chart: {
        defaultTimeRange: 'ALL',
        chartType: 'line',
        visibleStats: {
            totalPnL: true,
            winRate: true,
            sharpeRatio: true,
            maxDrawdown: true,
            avgWin: true,
            avgLoss: true,
        },
        dataPrecision: 0,
        percentagePrecision: 2,
    },
    dataManagement: {
        exportFormat: 'json',
        exportRange: 'all',
        autoBackup: false,
        backupFrequency: 'weekly',
    },
    notification: {
        dailyReminder: false,
        unrecordedAlert: false,
        goalAchievement: true,
        soundEffects: true,
    },
};
