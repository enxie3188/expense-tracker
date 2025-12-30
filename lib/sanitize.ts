/**
 * 輸入清理工具 - 防止 XSS 攻擊
 */

/**
 * 清理文字輸入，移除潛在的 XSS 攻擊向量
 * 這會移除 HTML 標籤和 JavaScript 事件處理器
 */
export function sanitizeText(input: string | undefined | null): string {
    if (!input) return '';

    // 轉換為字串
    const text = String(input);

    // 移除 HTML 標籤
    let sanitized = text.replace(/<[^>]*>/g, '');

    // 移除 JavaScript 協議
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    // 移除潛在的腳本注入
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');

    // HTML 實體編碼特殊字符
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    return sanitized.trim();
}

/**
 * 清理數字輸入
 */
export function sanitizeNumber(input: string | number | undefined | null): number {
    if (input === null || input === undefined) return 0;

    const text = String(input);
    // 只保留數字、小數點、負號
    const cleaned = text.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);

    return isNaN(num) ? 0 : num;
}

/**
 * 清理日期輸入
 */
export function sanitizeDate(input: string | Date | undefined | null): Date | null {
    if (!input) return null;

    try {
        const date = input instanceof Date ? input : new Date(String(input));
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}

/**
 * 清理物件的所有文字屬性
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };

    for (const key in sanitized) {
        const value = sanitized[key];

        if (typeof value === 'string') {
            sanitized[key] = sanitizeText(value) as any;
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map((item: any) =>
                typeof item === 'string' ? sanitizeText(item) :
                    typeof item === 'object' && item !== null ? sanitizeObject(item) :
                        item
            ) as any;
        }
    }

    return sanitized;
}
