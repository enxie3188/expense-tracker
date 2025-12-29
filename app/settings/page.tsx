'use client';

import { useSettings } from '@/hooks/useSettings';
import { useFinance } from '@/hooks/useFinance';
import { useTranslation } from '@/hooks/useTranslation';
import { SettingsSection } from '@/components/SettingsSection';
import {
    Palette,
    Book,
    Receipt,
    Database,
    Bell,
    RotateCcw,
    Folders,
    Plus,
    Trash2,
    Pencil,
    FileSpreadsheet,
    Cloud,
    RefreshCw,
    CloudOff,
    Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { LedgerModal } from '@/components/LedgerModal';
import { StrategyModal } from '@/components/StrategyModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { CSVImportModal } from '@/components/CSVImportModal';
import { Ledger, Strategy } from '@/types/ledger';

export default function SettingsPage() {
    const {
        settings,
        isLoaded,
        updateAppearance,
        updateLedger,
        updateTransaction,
        updateNotification,
        resetSettings,
    } = useSettings();

    const {
        ledgers, strategies, transactions,
        addLedger, addStrategy, deleteLedger, deleteStrategy,
        updateLedger: updateFinanceLedger, updateStrategy: updateFinanceStrategy,
        isLoading: financeLoading,
        clearAllData, clearTransactions, importAllData,
        syncStatus, isLoggedIn, migrateToCloud, refreshFromCloud
    } = useFinance();
    const { t } = useTranslation();
    const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
    const [strategyModalOpen, setStrategyModalOpen] = useState(false);
    const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
    const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        type: 'ledger' | 'strategy';
        id: string;
        name: string;
    } | null>(null);
    const [resetConfirm, setResetConfirm] = useState(false);
    const [csvModalOpen, setCSVModalOpen] = useState(false);

    // Apply theme changes to document
    useEffect(() => {
        if (!isLoaded) return;

        const root = document.documentElement;

        const applyTheme = () => {
            // Apply theme
            if (settings.appearance.theme === 'dark') {
                root.classList.remove('light-mode');
                root.classList.add('dark-mode');
            } else if (settings.appearance.theme === 'light') {
                root.classList.remove('dark-mode');
                root.classList.add('light-mode');
            } else {
                // Auto mode - use system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    root.classList.remove('light-mode');
                    root.classList.add('dark-mode');
                } else {
                    root.classList.remove('dark-mode');
                    root.classList.add('light-mode');
                }
            }
        };

        // Apply theme immediately
        applyTheme();

        // Listen for system theme changes (only in auto mode)
        if (settings.appearance.theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme();

            // Modern browsers
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleChange);
            } else {
                // Fallback for older browsers
                mediaQuery.addListener(handleChange);
            }

            return () => {
                if (mediaQuery.removeEventListener) {
                    mediaQuery.removeEventListener('change', handleChange);
                } else {
                    mediaQuery.removeListener(handleChange);
                }
            };
        }

        // Apply font size
        root.setAttribute('data-font-size', settings.appearance.fontSize);
    }, [settings.appearance.theme, settings.appearance.fontSize, isLoaded]);

    if (!isLoaded || financeLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] pb-24 lg:pb-8 flex items-center justify-center w-full">
                <div className="text-[var(--text-muted)]">載入設定中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-24 lg:pb-8 w-full">
            <div className="max-w-full mx-auto px-4 lg:px-8 py-8 pt-16 lg:pt-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{t.settings.title}</h1>
                        <p className="text-[var(--text-secondary)] text-sm">
                            {t.settings.subtitle}
                        </p>
                    </div>

                    {/* Cloud Sync Status - Compact */}
                    <div className="flex items-center gap-3">
                        {isLoggedIn ? (
                            <>
                                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-[var(--text-secondary)]">
                                        {syncStatus.isSyncing ? '同步中...' : '已同步'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => refreshFromCloud()}
                                    disabled={syncStatus.isSyncing}
                                    className="p-2 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] rounded-lg border border-[var(--border-subtle)] transition-colors disabled:opacity-50"
                                    title="重新整理"
                                >
                                    <RefreshCw size={16} className={syncStatus.isSyncing ? 'animate-spin' : ''} />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                                <CloudOff size={14} className="text-[var(--text-muted)]" />
                                <span className="text-xs text-[var(--text-muted)]">未登入</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Migration Notice (show at top if needed) */}
                {syncStatus.migrationNeeded && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <div>
                                    <p className="font-medium text-amber-400">發現本地資料需要上傳</p>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {ledgers.length} 個帳本, {transactions.length} 筆交易
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    try {
                                        await migrateToCloud();
                                        alert('資料已成功遷移到雲端！');
                                    } catch (err) {
                                        alert('遷移失敗: ' + (err instanceof Error ? err.message : '未知錯誤'));
                                    }
                                }}
                                disabled={syncStatus.isSyncing}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                            >
                                {syncStatus.isSyncing ? (
                                    <><Loader2 size={16} className="animate-spin" />遷移中...</>
                                ) : (
                                    <><Cloud size={16} />上傳到雲端</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Sync Error */}
                {syncStatus.error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        同步錯誤: {syncStatus.error}
                    </div>
                )}

                {/* Settings Sections */}
                <div className="space-y-4">
                    {/* 1. 外觀與顯示 */}
                    <SettingsSection
                        title={t.settings.appearance.title}
                        icon={<Palette size={20} />}
                        description={t.settings.appearance.description}
                    >
                        <div className="space-y-6 max-w-2xl">
                            {/* Theme Mode */}
                            <div>
                                <label className="block text-sm font-medium mb-3">{t.settings.appearance.theme}</label>
                                <div className="flex gap-3">
                                    {(['dark', 'light', 'auto'] as const).map((theme) => (
                                        <button
                                            key={theme}
                                            onClick={() => updateAppearance({ theme })}
                                            className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${settings.appearance.theme === theme
                                                ? 'border-[var(--neon-blue)] bg-[var(--neon-blue)]/10'
                                                : 'border-[var(--border-default)] hover:border-[var(--border-hover)]'
                                                }`}
                                        >
                                            {theme === 'dark' && t.settings.appearance.themeDark}
                                            {theme === 'light' && t.settings.appearance.themeLight}
                                            {theme === 'auto' && t.settings.appearance.themeAuto}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Language */}
                            <div>
                                <label className="block text-sm font-medium mb-3">{t.settings.appearance.language}</label>
                                <select
                                    value={settings.appearance.language}
                                    onChange={(e) =>
                                        updateAppearance({ language: e.target.value as any })
                                    }
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--neon-blue)]"
                                >
                                    <option value="zh-TW">繁體中文</option>
                                    <option value="en">English</option>
                                </select>
                            </div>

                            {/* Font Size */}
                            <div>
                                <label className="block text-sm font-medium mb-3">{t.settings.appearance.fontSize}</label>
                                <div className="flex gap-3">
                                    {(['small', 'medium', 'large'] as const).map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => updateAppearance({ fontSize: size })}
                                            className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${settings.appearance.fontSize === size
                                                ? 'border-[var(--neon-blue)] bg-[var(--neon-blue)]/10'
                                                : 'border-[var(--border-default)] hover:border-[var(--border-hover)]'
                                                }`}
                                        >
                                            {size === 'small' && t.settings.appearance.fontSmall}
                                            {size === 'medium' && t.settings.appearance.fontMedium}
                                            {size === 'large' && t.settings.appearance.fontLarge}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SettingsSection>

                    {/* 帳本與策略管理 */}
                    <SettingsSection
                        title={t.settings.ledgerStrategy.title}
                        icon={<Folders size={20} />}
                        description={t.settings.ledgerStrategy.description}
                    >
                        <div className="space-y-6 max-w-2xl">
                            {/* Ledgers List */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium">
                                        {t.settings.ledgerStrategy.ledgers} ({ledgers.length})
                                    </label>
                                    <button
                                        onClick={() => setLedgerModalOpen(true)}
                                        className="px-3 py-1.5 bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 rounded-lg transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <Plus size={16} />
                                        {t.settings.ledgerStrategy.addLedger}
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {ledgers.length === 0 ? (
                                        <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                                            {t.settings.ledgerStrategy.noLedgers}
                                        </div>
                                    ) : (
                                        ledgers.map((ledger) => (
                                            <div
                                                key={ledger.id}
                                                className="group flex items-center gap-3 p-3 bg-[var(--bg-hover)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: ledger.color }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">
                                                        {ledger.name}
                                                    </div>
                                                    <div className="text-xs text-[var(--text-muted)]">
                                                        {ledger.assetType}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-[var(--text-muted)]">
                                                    {ledger.initialBalance?.toFixed(0) || '0'}
                                                </div>
                                                <div className="flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => {
                                                            setEditingLedger(ledger);
                                                            setLedgerModalOpen(true);
                                                        }}
                                                        className="p-2 hover:bg-[var(--neon-blue)]/20 rounded-lg"
                                                        title="編輯帳本"
                                                    >
                                                        <Pencil size={16} className="text-[var(--neon-blue)]" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDeleteConfirm({
                                                                type: 'ledger',
                                                                id: ledger.id,
                                                                name: ledger.name
                                                            });
                                                        }}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg"
                                                        title="刪除帳本"
                                                    >
                                                        <Trash2 size={16} className="text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Strategies List */}
                            <div className="pt-4 border-t border-[var(--border-subtle)]">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium">
                                        {t.settings.ledgerStrategy.strategies} ({strategies.length})
                                    </label>
                                    <button
                                        onClick={() => setStrategyModalOpen(true)}
                                        className="px-3 py-1.5 bg-[var(--neon-green)] hover:bg-[var(--neon-green)]/80 rounded-lg transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <Plus size={16} />
                                        {t.settings.ledgerStrategy.addStrategy}
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {strategies.length === 0 ? (
                                        <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                                            {t.settings.ledgerStrategy.noStrategies}
                                        </div>
                                    ) : (
                                        strategies.map((strategy) => (
                                            <div
                                                key={strategy.id}
                                                className="group flex items-center gap-3 p-3 bg-[var(--bg-hover)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: strategy.color }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">
                                                        {strategy.name}
                                                    </div>
                                                    {strategy.description && (
                                                        <div className="text-xs text-[var(--text-muted)] truncate">
                                                            {strategy.description}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => {
                                                            setEditingStrategy(strategy);
                                                            setStrategyModalOpen(true);
                                                        }}
                                                        className="p-2 hover:bg-[var(--neon-green)]/20 rounded-lg"
                                                        title="編輯策略"
                                                    >
                                                        <Pencil size={16} className="text-[var(--neon-green)]" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDeleteConfirm({
                                                                type: 'strategy',
                                                                id: strategy.id,
                                                                name: strategy.name
                                                            });
                                                        }}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg"
                                                        title="刪除策略"
                                                    >
                                                        <Trash2 size={16} className="text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </SettingsSection>

                    {/* 通知與提醒 */}
                    <SettingsSection
                        title={t.settings.notification.title}
                        icon={<Bell size={20} />}
                        description={t.settings.notification.description}
                    >
                        <div className="space-y-3 max-w-2xl">
                            <label className="flex items-center justify-between p-4 bg-[var(--bg-hover)] rounded-lg cursor-pointer">
                                <span className="text-sm">{t.settings.notification.dailyReminder}</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notification.dailyReminder}
                                    onChange={(e) =>
                                        updateNotification({ dailyReminder: e.target.checked })
                                    }
                                    className="w-5 h-5"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-[var(--bg-hover)] rounded-lg cursor-pointer">
                                <span className="text-sm">{t.settings.notification.soundEffects}</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notification.soundEffects}
                                    onChange={(e) =>
                                        updateNotification({ soundEffects: e.target.checked })
                                    }
                                    className="w-5 h-5"
                                />
                            </label>
                        </div>
                    </SettingsSection>

                    {/* 3. 交易記錄設定 */}
                    <SettingsSection
                        title={t.settings.transaction.title}
                        icon={<Receipt size={20} />}
                        description={t.settings.transaction.description}
                    >
                        <div className="space-y-6 max-w-2xl">
                            {/* Default Sort */}
                            <div>
                                <label className="block text-sm font-medium mb-3">{t.settings.transaction.defaultSort}</label>
                                <select
                                    value={settings.transaction.defaultSort}
                                    onChange={(e) =>
                                        updateTransaction({ defaultSort: e.target.value as any })
                                    }
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--neon-blue)]"
                                >
                                    <option value="date-desc">{t.settings.transaction.sortDateDesc}</option>
                                    <option value="date-asc">{t.settings.transaction.sortDateAsc}</option>
                                    <option value="amount-desc">{t.settings.transaction.sortAmountDesc}</option>
                                    <option value="amount-asc">{t.settings.transaction.sortAmountAsc}</option>
                                </select>
                            </div>

                            {/* Items Per Page */}
                            <div>
                                <label className="block text-sm font-medium mb-3">{t.settings.transaction.itemsPerPage}</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[10, 20, 30, 50, 100].map((count) => (
                                        <button
                                            key={count}
                                            onClick={() => updateTransaction({ itemsPerPage: count })}
                                            className={`px-4 py-3 rounded-lg border transition-colors ${settings.transaction.itemsPerPage === count
                                                ? 'border-[var(--neon-blue)] bg-[var(--neon-blue)]/10'
                                                : 'border-[var(--border-default)] hover:border-[var(--border-hover)]'
                                                }`}
                                        >
                                            {count}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Show Filters */}
                            <label className="flex items-center justify-between p-4 bg-[var(--bg-hover)] rounded-lg cursor-pointer">
                                <span className="text-sm">{t.settings.transaction.showFilters}</span>
                                <input
                                    type="checkbox"
                                    checked={settings.transaction.showFilters}
                                    onChange={(e) =>
                                        updateTransaction({ showFilters: e.target.checked })
                                    }
                                    className="w-5 h-5"
                                />
                            </label>
                        </div>
                    </SettingsSection>

                    {/* 5. 資料管理 */}
                    <SettingsSection
                        title={t.settings.data.title}
                        icon={<Database size={20} />}
                        description={t.settings.data.description}
                    >
                        <div className="space-y-4 max-w-2xl">
                            <button
                                onClick={() => {
                                    const exportData = {
                                        ledgers,
                                        strategies,
                                        transactions,
                                        settings,
                                        exportDate: new Date().toISOString(),
                                    };
                                    const dataStr = JSON.stringify(exportData, null, 2);
                                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                    const url = URL.createObjectURL(dataBlob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
                                    link.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-default)] hover:border-[var(--border-hover)] rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Database size={18} />
                                {t.settings.data.export}
                            </button>

                            <button
                                onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = '.json';
                                    input.onchange = async (e: any) => {
                                        const file = e.target?.files?.[0];
                                        if (!file) return;

                                        try {
                                            const text = await file.text();
                                            const data = JSON.parse(text);

                                            // 驗證資料格式
                                            if (!data.transactions && !data.ledgers && !data.strategies) {
                                                alert(t.settings.data.importInvalid);
                                                return;
                                            }

                                            // 確認是否覆蓋現有資料
                                            const confirmed = window.confirm(
                                                t.settings.data.importConfirm
                                                    .replace('{transactions}', data.transactions?.length || 0)
                                                    .replace('{ledgers}', data.ledgers?.length || 0)
                                                    .replace('{strategies}', data.strategies?.length || 0)
                                            );

                                            if (confirmed) {
                                                importAllData({
                                                    transactions: data.transactions,
                                                    ledgers: data.ledgers,
                                                    strategies: data.strategies,
                                                    categories: data.categories,
                                                });
                                                alert(t.settings.data.importSuccess);
                                            }
                                        } catch (error) {
                                            alert(t.settings.data.importError);
                                            console.error('Import error:', error);
                                        }
                                    };
                                    input.click();
                                }}
                                className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-default)] hover:border-[var(--border-hover)] rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Database size={18} />
                                {t.settings.data.import}
                            </button>

                            <button
                                onClick={() => setCSVModalOpen(true)}
                                className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-default)] hover:border-[var(--border-hover)] rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <FileSpreadsheet size={18} />
                                CSV 導入
                            </button>

                            <button
                                onClick={() => {
                                    const confirmed = window.confirm(
                                        t.settings.data.clearTransactionsConfirm.replace('{count}', transactions.length.toString())
                                    );
                                    if (confirmed) {
                                        clearTransactions();
                                        alert(t.settings.data.clearTransactionsSuccess);
                                    }
                                }}
                                className="w-full px-4 py-3 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-500 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                {t.settings.data.clearTransactions}
                            </button>

                            <button
                                onClick={() => setResetConfirm(true)}
                                className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} />
                                {t.settings.data.reset}
                            </button>
                        </div>
                    </SettingsSection>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirm !== null}
                onCancel={() => setDeleteConfirm(null)}
                onConfirm={() => {
                    if (deleteConfirm) {
                        if (deleteConfirm.type === 'ledger') {
                            deleteLedger(deleteConfirm.id);
                        } else {
                            deleteStrategy(deleteConfirm.id);
                        }
                        setDeleteConfirm(null);
                    }
                }}
                title={deleteConfirm?.type === 'ledger' ? t.settings.ledgerStrategy.deleteLedgerTitle : t.settings.ledgerStrategy.deleteStrategyTitle}
                message={
                    deleteConfirm?.type === 'ledger'
                        ? t.settings.ledgerStrategy.deleteLedgerMessage.replace('{name}', deleteConfirm.name)
                        : t.settings.ledgerStrategy.deleteStrategyMessage.replace('{name}', deleteConfirm?.name || '')
                }
                confirmText={t.common.delete}
                cancelText={t.common.cancel}
            />

            {/* Ledger Modal */}
            <LedgerModal
                isOpen={ledgerModalOpen}
                onClose={() => {
                    setLedgerModalOpen(false);
                    setEditingLedger(null);
                }}
                onSave={(data) => {
                    if (editingLedger) {
                        updateFinanceLedger(editingLedger.id, data);
                    } else {
                        addLedger(data);
                    }
                }}
                initialData={editingLedger || undefined}
            />

            {/* Strategy Modal */}
            <StrategyModal
                isOpen={strategyModalOpen}
                onClose={() => {
                    setStrategyModalOpen(false);
                    setEditingStrategy(null);
                }}
                onSave={(data) => {
                    if (editingStrategy) {
                        updateFinanceStrategy(editingStrategy.id, data);
                    } else {
                        addStrategy(data);
                    }
                }}
                initialData={editingStrategy || undefined}
            />

            {/* Reset Confirmation Modal */}
            <ConfirmModal
                isOpen={resetConfirm}
                title={t.settings.data.resetTitle}
                message={t.settings.data.resetMessage}
                confirmText={t.common.reset}
                cancelText={t.common.cancel}
                onConfirm={() => {
                    resetSettings();
                    clearAllData();
                    setResetConfirm(false);
                    alert(t.settings.data.resetSuccess);
                }}
                onCancel={() => setResetConfirm(false)}
            />

            {/* CSV Import Modal */}
            <CSVImportModal
                isOpen={csvModalOpen}
                onClose={() => setCSVModalOpen(false)}
                onImport={(newTransactions) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    importAllData({ transactions: newTransactions as any[] });
                    alert(`成功導入 ${newTransactions.length} 筆交易記錄！`);
                }}
                ledgerId={ledgers[0]?.id || ''}
            />
        </div>
    );
}
