/**
 * 期貨合約規格資料庫
 */
export const FUTURES_SPECS: Record<string, {
    name: string;
    pointValue: number;
    exchange: string;
    category: string;
}> = {
    // === 美國指數期貨 ===
    'ES': {
        name: 'E-mini S&P 500',
        pointValue: 50,
        exchange: 'CME',
        category: '指數'
    },
    'MES': {
        name: 'Micro E-mini S&P 500',
        pointValue: 5,
        exchange: 'CME',
        category: '指數'
    },
    'NQ': {
        name: 'E-mini Nasdaq-100',
        pointValue: 20,
        exchange: 'CME',
        category: '指數'
    },
    'MNQ': {
        name: 'Micro E-mini Nasdaq-100',
        pointValue: 2,
        exchange: 'CME',
        category: '指數'
    },
    'YM': {
        name: 'E-mini Dow Jones',
        pointValue: 5,
        exchange: 'CME',
        category: '指數'
    },
    'MYM': {
        name: 'Micro E-mini Dow Jones',
        pointValue: 0.5,
        exchange: 'CME',
        category: '指數'
    },
    'RTY': {
        name: 'E-mini Russell 2000',
        pointValue: 50,
        exchange: 'CME',
        category: '指數'
    },
    'M2K': {
        name: 'Micro E-mini Russell 2000',
        pointValue: 5,
        exchange: 'CME',
        category: '指數'
    },

    // === 台灣期貨 ===
    'TX': {
        name: '台指期',
        pointValue: 200,
        exchange: 'TAIFEX',
        category: '指數'
    },
    'MTX': {
        name: '小台指',
        pointValue: 50,
        exchange: 'TAIFEX',
        category: '指數'
    },
    'TE': {
        name: '電子期',
        pointValue: 4000,
        exchange: 'TAIFEX',
        category: '指數'
    },
    'TF': {
        name: '金融期',
        pointValue: 1000,
        exchange: 'TAIFEX',
        category: '指數'
    },

    // === 能源期貨 ===
    'CL': {
        name: 'Crude Oil (WTI)',
        pointValue: 1000,
        exchange: 'NYMEX',
        category: '能源'
    },
    'MCL': {
        name: 'Micro Crude Oil',
        pointValue: 100,
        exchange: 'NYMEX',
        category: '能源'
    },
    'NG': {
        name: 'Natural Gas',
        pointValue: 10000,
        exchange: 'NYMEX',
        category: '能源'
    },

    // === 貴金屬期貨 ===
    'GC': {
        name: 'Gold',
        pointValue: 100,
        exchange: 'COMEX',
        category: '貴金屬'
    },
    'MGC': {
        name: 'Micro Gold',
        pointValue: 10,
        exchange: 'COMEX',
        category: '貴金屬'
    },
    'SI': {
        name: 'Silver',
        pointValue: 5000,
        exchange: 'COMEX',
        category: '貴金屬'
    },
    'HG': {
        name: 'Copper',
        pointValue: 25000,
        exchange: 'COMEX',
        category: '貴金屬'
    },

    // === 農產品期貨 ===
    'ZC': {
        name: 'Corn',
        pointValue: 50,
        exchange: 'CBOT',
        category: '農產品'
    },
    'ZW': {
        name: 'Wheat',
        pointValue: 50,
        exchange: 'CBOT',
        category: '農產品'
    },
    'ZS': {
        name: 'Soybeans',
        pointValue: 50,
        exchange: 'CBOT',
        category: '農產品'
    },
};

/**
 * 根據標的代號獲取期貨規格
 */
export function getFuturesSpec(ticker: string) {
    return FUTURES_SPECS[ticker.toUpperCase()];
}

/**
 * 獲取所有期貨標的列表（用於自動完成）
 */
export function getAllFuturesTickers() {
    return Object.keys(FUTURES_SPECS);
}

/**
 * 按類別分組期貨
 */
export function getFuturesByCategory() {
    const grouped: Record<string, string[]> = {};

    Object.entries(FUTURES_SPECS).forEach(([ticker, spec]) => {
        if (!grouped[spec.category]) {
            grouped[spec.category] = [];
        }
        grouped[spec.category].push(ticker);
    });

    return grouped;
}
