// i18n index - exports all translations
import { zhTW, Translations } from './zh-TW';
import { en } from './en';

export type { Translations };

export const translations: Record<string, Translations> = {
    'zh-TW': zhTW,
    'en': en,
};

export { zhTW, en };
