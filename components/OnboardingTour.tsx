'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, BookOpen, Plus, BarChart3, Settings, Sparkles } from 'lucide-react';

interface TourStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    highlight?: string; // CSS selector to highlight
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: '歡迎使用 AlphaLog！',
        description: '這是您的專屬交易日誌系統。讓我們快速了解如何使用各項功能，幫助您追蹤和分析交易績效。',
        icon: <Sparkles className="w-8 h-8" />,
    },
    {
        id: 'ledger',
        title: '創建帳本',
        description: '首先，您需要創建一個帳本。帳本可以是不同的交易帳戶，例如「美股帳戶」、「期貨帳戶」等。前往設定頁面創建您的第一個帳本。',
        icon: <BookOpen className="w-8 h-8" />,
        highlight: '[data-tour="settings"]',
    },
    {
        id: 'transaction',
        title: '記錄交易',
        description: '點擊底部的「+」按鈕來記錄新的交易。包含買入價、賣出價、數量等資訊，系統會自動計算盈虧。',
        icon: <Plus className="w-8 h-8" />,
        highlight: '[data-tour="add-button"]',
    },
    {
        id: 'dashboard',
        title: 'Dashboard 總覽',
        description: 'Dashboard 顯示您的權益曲線、總盈虧、勝率等關鍵指標。一目瞭然掌握交易表現。',
        icon: <BarChart3 className="w-8 h-8" />,
        highlight: '[data-tour="dashboard"]',
    },
    {
        id: 'analytics',
        title: '績效分析',
        description: '在「績效分析」頁面，您可以看到更詳細的統計數據，包括月曆熱力圖、策略績效比較等。',
        icon: <BarChart3 className="w-8 h-8" />,
        highlight: '[data-tour="analytics"]',
    },
    {
        id: 'settings',
        title: '帳本與策略管理',
        description: '在「設定」中管理您的帳本和交易策略。您可以創建多個帳本來區分不同的交易帳戶。',
        icon: <Settings className="w-8 h-8" />,
        highlight: '[data-tour="settings"]',
    },
];

const ONBOARDING_KEY = 'alphalog_onboarding_completed';

interface OnboardingTourProps {
    onComplete?: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // 檢查是否已完成教學
        const completed = localStorage.getItem(ONBOARDING_KEY);
        if (!completed) {
            // 短暫延遲後顯示
            const timer = setTimeout(() => setIsVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsVisible(false);
        onComplete?.();
    };

    if (!isVisible) return null;

    const step = TOUR_STEPS[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === TOUR_STEPS.length - 1;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 z-50 animate-fade-in"
                onClick={handleSkip}
            />

            {/* Modal */}
            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md animate-scale-in"
            >
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    {/* Header */}
                    <div
                        className="px-6 py-4 flex items-center justify-between"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                        <div className="flex items-center gap-2">
                            {TOUR_STEPS.map((_, index) => (
                                <div
                                    key={index}
                                    className="w-2 h-2 rounded-full transition-all"
                                    style={{
                                        backgroundColor: index === currentStep
                                            ? 'var(--neon-blue)'
                                            : index < currentStep
                                                ? 'var(--neon-cyan)'
                                                : 'var(--bg-hover)',
                                    }}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleSkip}
                            className="p-1 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center">
                        {/* Icon */}
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                            style={{
                                background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))',
                                color: 'white',
                            }}
                        >
                            {step.icon}
                        </div>

                        {/* Title */}
                        <h2
                            className="text-xl font-bold mb-4"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {step.title}
                        </h2>

                        {/* Description */}
                        <p
                            className="leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {step.description}
                        </p>
                    </div>

                    {/* Footer */}
                    <div
                        className="px-6 py-4 flex items-center justify-between"
                        style={{ borderTop: '1px solid var(--border-subtle)' }}
                    >
                        {isFirstStep ? (
                            <button
                                onClick={handleSkip}
                                className="px-4 py-2 text-sm transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                跳過導覽
                            </button>
                        ) : (
                            <button
                                onClick={handlePrev}
                                className="px-4 py-2 text-sm flex items-center gap-1 transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                上一步
                            </button>
                        )}

                        <button
                            onClick={handleNext}
                            className="px-6 py-2 rounded-xl font-medium flex items-center gap-1 transition-all hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))',
                                color: 'white',
                            }}
                        >
                            {isLastStep ? '開始使用' : '下一步'}
                            {!isLastStep && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/**
 * 重設教學狀態的 Hook
 */
export function useOnboardingReset() {
    const resetOnboarding = () => {
        localStorage.removeItem(ONBOARDING_KEY);
        window.location.reload();
    };

    return { resetOnboarding };
}

/**
 * 檢查教學是否已完成
 */
export function useOnboardingStatus() {
    const [isCompleted, setIsCompleted] = useState(true);

    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        setIsCompleted(!!completed);
    }, []);

    return { isCompleted };
}
