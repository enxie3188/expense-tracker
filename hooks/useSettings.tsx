'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { Settings, DEFAULT_SETTINGS } from '@/types/settings';

const SETTINGS_STORAGE_KEY = 'trading-journal-settings';

interface SettingsContextType {
    settings: Settings;
    isLoaded: boolean;
    updateAppearance: (updates: Partial<Settings['appearance']>) => void;
    updateLedger: (updates: Partial<Settings['ledger']>) => void;
    updateTransaction: (updates: Partial<Settings['transaction']>) => void;
    updateChart: (updates: Partial<Settings['chart']>) => void;
    updateDataManagement: (updates: Partial<Settings['dataManagement']>) => void;
    updateNotification: (updates: Partial<Settings['notification']>) => void;
    resetSettings: () => void;
    resetCategory: (category: keyof Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        const loadSettings = () => {
            try {
                const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setSettings({
                        appearance: { ...DEFAULT_SETTINGS.appearance, ...parsed.appearance },
                        ledger: { ...DEFAULT_SETTINGS.ledger, ...parsed.ledger },
                        transaction: { ...DEFAULT_SETTINGS.transaction, ...parsed.transaction },
                        chart: { ...DEFAULT_SETTINGS.chart, ...parsed.chart },
                        dataManagement: { ...DEFAULT_SETTINGS.dataManagement, ...parsed.dataManagement },
                        notification: { ...DEFAULT_SETTINGS.notification, ...parsed.notification },
                    });
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadSettings();
    }, []);

    // Theme Application Effect
    useEffect(() => {
        const applyTheme = () => {
            const root = document.documentElement;
            const theme = settings.appearance.theme;

            let isDark = true; // Default to dark as per globals.css

            if (theme === 'auto') {
                isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            } else if (theme === 'light') {
                isDark = false;
            } else {
                isDark = true;
            }

            if (isDark) {
                root.classList.add('dark');
                root.classList.remove('light-mode');
            } else {
                root.classList.remove('dark');
                root.classList.add('light-mode');
            }
        };

        applyTheme();
    }, [settings.appearance.theme]);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            } catch (error) {
                console.error('Failed to save settings:', error);
            }
        }
    }, [settings, isLoaded]);

    const updateAppearance = useCallback((updates: Partial<Settings['appearance']>) => {
        setSettings((prev) => ({ ...prev, appearance: { ...prev.appearance, ...updates } }));
    }, []);

    const updateLedger = useCallback((updates: Partial<Settings['ledger']>) => {
        setSettings((prev) => ({ ...prev, ledger: { ...prev.ledger, ...updates } }));
    }, []);

    const updateTransaction = useCallback((updates: Partial<Settings['transaction']>) => {
        setSettings((prev) => ({ ...prev, transaction: { ...prev.transaction, ...updates } }));
    }, []);

    const updateChart = useCallback((updates: Partial<Settings['chart']>) => {
        setSettings((prev) => ({ ...prev, chart: { ...prev.chart, ...updates } }));
    }, []);

    const updateDataManagement = useCallback((updates: Partial<Settings['dataManagement']>) => {
        setSettings((prev) => ({ ...prev, dataManagement: { ...prev.dataManagement, ...updates } }));
    }, []);

    const updateNotification = useCallback((updates: Partial<Settings['notification']>) => {
        setSettings((prev) => ({ ...prev, notification: { ...prev.notification, ...updates } }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
    }, []);

    const resetCategory = useCallback((category: keyof Settings) => {
        setSettings((prev) => ({
            ...prev,
            [category]: DEFAULT_SETTINGS[category],
        }));
    }, []);

    const value = {
        settings,
        isLoaded,
        updateAppearance,
        updateLedger,
        updateTransaction,
        updateChart,
        updateDataManagement,
        updateNotification,
        resetSettings,
        resetCategory,
    };

    return <SettingsContext.Provider value={value}> {children} </SettingsContext.Provider>;
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
