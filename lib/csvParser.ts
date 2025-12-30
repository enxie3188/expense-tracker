/**
 * CSV 解析工具
 * 解析 CSV 文件並轉換為交易記錄格式
 */

import { TradingTransaction } from '@/types/ledger';
import { sanitizeText, sanitizeNumber } from './sanitize';

export interface CSVColumn {
    index: number;
    name: string;
}

export interface CSVData {
    headers: string[];
    rows: string[][];
}

/**
 * 解析 CSV 字串
 */
export function parseCSV(csvText: string): CSVData {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
        return { headers: [], rows: [] };
    }

    // 解析一行 CSV（處理引號內的逗號）
    const parseLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(line => parseLine(line));

    return { headers, rows };
}

/**
 * 欄位對應設定
 */
export interface ColumnMapping {
    date: number;           // 日期欄位索引
    symbol: number;         // 標的欄位索引
    direction: number;      // 方向欄位索引（-1 表示不使用）
    entryPrice: number;     // 入場價欄位索引（-1 表示不使用）
    exitPrice: number;      // 出場價欄位索引（-1 表示不使用）
    quantity: number;       // 數量欄位索引（-1 表示不使用）
    pnl: number;           // 盈虧欄位索引
}

/**
 * 將 CSV 資料轉換為交易記錄
 * 包含 XSS 防護 - 所有文字輸入都會被清理
 */
export function convertCSVToTransactions(
    csvData: CSVData,
    mapping: ColumnMapping,
    ledgerId: string
): TradingTransaction[] {
    const transactions: TradingTransaction[] = [];

    for (const row of csvData.rows) {
        try {
            // 解析日期
            const dateStr = row[mapping.date];
            const date = parseDate(dateStr);
            if (!date) continue;

            // 解析標的 - 使用 sanitizeText 防止 XSS
            const symbol = sanitizeText(row[mapping.symbol]) || 'Unknown';

            // 解析方向
            let direction: 'long' | 'short' = 'long';
            if (mapping.direction >= 0 && row[mapping.direction]) {
                const dirStr = sanitizeText(row[mapping.direction]).toLowerCase();
                if (dirStr.includes('short') || dirStr.includes('賣') || dirStr.includes('空')) {
                    direction = 'short';
                }
            }

            // 解析盈虧 - 使用 sanitizeNumber
            const pnl = sanitizeNumber(row[mapping.pnl]);

            // 解析其他欄位 - 使用 sanitizeNumber
            const entryPrice = mapping.entryPrice >= 0
                ? sanitizeNumber(row[mapping.entryPrice])
                : undefined;
            const exitPrice = mapping.exitPrice >= 0
                ? sanitizeNumber(row[mapping.exitPrice])
                : undefined;
            const quantity = mapping.quantity >= 0
                ? sanitizeNumber(row[mapping.quantity])
                : undefined;

            const transaction: TradingTransaction = {
                id: `csv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ledgerId,
                type: direction,
                direction,
                symbol,
                entryPrice,
                exitPrice,
                quantity,
                pnl,
                date: date.toISOString(),
                createdAt: new Date().toISOString(),
            };

            transactions.push(transaction);
        } catch (error) {
            console.error('Error parsing row:', row, error);
        }
    }

    return transactions;
}

/**
 * 解析日期字串（支援多種格式）
 */
function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // 移除多餘空白
    dateStr = dateStr.trim();

    // 嘗試直接解析
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date;
    }

    // 嘗試 YYYY/MM/DD 或 YYYY-MM-DD 格式
    const isoMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
        const [, year, month, day] = isoMatch;
        const timeMatch = dateStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (timeMatch) {
            const [, hour, minute, second = '0'] = timeMatch;
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day),
                parseInt(hour), parseInt(minute), parseInt(second));
        } else {
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        if (!isNaN(date.getTime())) return date;
    }

    // 嘗試 MM/DD/YYYY 格式
    const usMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (usMatch) {
        const [, month, day, year] = usMatch;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) return date;
    }

    // 嘗試 DD/MM/YYYY 格式（歐洲格式）
    const euMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (euMatch) {
        const [, day, month, year] = euMatch;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) return date;
    }

    return null;
}

/**
 * 自動偵測欄位對應
 */
export function autoDetectMapping(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {
        date: -1,
        symbol: -1,
        direction: -1,
        entryPrice: -1,
        exitPrice: -1,
        quantity: -1,
        pnl: -1,
    };

    const dateKeywords = ['date', '日期', 'time', '時間', '交易日'];
    const symbolKeywords = ['symbol', '標的', 'ticker', '代號', '股票', '商品'];
    const directionKeywords = ['direction', '方向', 'type', '類型', 'side', '買賣'];
    const entryKeywords = ['entry', '入場', 'open', '開倉', '買入價'];
    const exitKeywords = ['exit', '出場', 'close', '平倉', '賣出價'];
    const quantityKeywords = ['quantity', '數量', 'qty', 'size', '口數', '張數'];
    const pnlKeywords = ['pnl', 'profit', '盈虧', '損益', 'gain', 'loss', '獲利'];

    headers.forEach((header, index) => {
        const lowerHeader = header.toLowerCase();

        if (mapping.date === -1 && dateKeywords.some(k => lowerHeader.includes(k))) {
            mapping.date = index;
        }
        if (mapping.symbol === -1 && symbolKeywords.some(k => lowerHeader.includes(k))) {
            mapping.symbol = index;
        }
        if (mapping.direction === -1 && directionKeywords.some(k => lowerHeader.includes(k))) {
            mapping.direction = index;
        }
        if (mapping.entryPrice === -1 && entryKeywords.some(k => lowerHeader.includes(k))) {
            mapping.entryPrice = index;
        }
        if (mapping.exitPrice === -1 && exitKeywords.some(k => lowerHeader.includes(k))) {
            mapping.exitPrice = index;
        }
        if (mapping.quantity === -1 && quantityKeywords.some(k => lowerHeader.includes(k))) {
            mapping.quantity = index;
        }
        if (mapping.pnl === -1 && pnlKeywords.some(k => lowerHeader.includes(k))) {
            mapping.pnl = index;
        }
    });

    // 如果找不到某些必要欄位，使用預設值
    if (mapping.date === -1 && headers.length > 0) mapping.date = 0;
    if (mapping.symbol === -1 && headers.length > 1) mapping.symbol = 1;
    if (mapping.pnl === -1 && headers.length > 2) mapping.pnl = headers.length - 1;

    return mapping;
}
