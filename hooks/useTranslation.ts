'use client';

import { useSettings } from './useSettings';
import { translations, Translations } from '@/lib/i18n';

/**
 * useTranslation Hook
 * 
 * 根據使用者的語言設定返回對應的翻譯內容
 * 
 * @returns t - 翻譯物件
 * @returns lang - 當前語言代碼
 */
export function useTranslation(): { t: Translations; lang: string } {
    const { settings, isLoaded } = useSettings();

    // 預設使用繁體中文
    const lang = isLoaded ? settings.appearance.language : 'zh-TW';
    const t = translations[lang] || translations['zh-TW'];

    return { t, lang };
}
