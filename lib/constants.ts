import { Category } from '@/types';

/**
 * 預設支出分類
 */
export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id'>[] = [
    {
        name: '飲食',
        type: 'expense',
        icon: 'UtensilsCrossed',
        color: 'orange',
        isDefault: true,
    },
    {
        name: '交通',
        type: 'expense',
        icon: 'Car',
        color: 'blue',
        isDefault: true,
    },
    {
        name: '購物',
        type: 'expense',
        icon: 'ShoppingBag',
        color: 'purple',
        isDefault: true,
    },
    {
        name: '娛樂',
        type: 'expense',
        icon: 'Gamepad2',
        color: 'pink',
        isDefault: true,
    },
    {
        name: '醫療',
        type: 'expense',
        icon: 'HeartPulse',
        color: 'red',
        isDefault: true,
    },
    {
        name: '居住',
        type: 'expense',
        icon: 'Home',
        color: 'green',
        isDefault: true,
    },
    {
        name: '其他',
        type: 'expense',
        icon: 'MoreHorizontal',
        color: 'gray',
        isDefault: true,
    },
];

/**
 * 預設收入分類
 */
export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id'>[] = [
    {
        name: '薪資',
        type: 'income',
        icon: 'Briefcase',
        color: 'green',
        isDefault: true,
    },
    {
        name: '獎金',
        type: 'income',
        icon: 'Gift',
        color: 'yellow',
        isDefault: true,
    },
    {
        name: '投資',
        type: 'income',
        icon: 'TrendingUp',
        color: 'blue',
        isDefault: true,
    },
    {
        name: '兼職',
        type: 'income',
        icon: 'Briefcase',
        color: 'purple',
        isDefault: true,
    },
    {
        name: '其他',
        type: 'income',
        icon: 'MoreHorizontal',
        color: 'gray',
        isDefault: true,
    },
];

/**
 * 所有預設分類
 */
export const DEFAULT_CATEGORIES = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...DEFAULT_INCOME_CATEGORIES,
];
