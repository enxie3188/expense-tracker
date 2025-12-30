'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, BookOpen, Plus, BarChart3, Settings, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const ONBOARDING_KEY = 'alphalog_onboarding_completed';

interface OnboardingTourProps {
    onComplete?: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // 使用 i18n 的步驟配置
    const tourSteps = [
        { id: 'welcome', icon: <Sparkles className="w-8 h-8" />, ...t.onboarding.steps.welcome },
        { id: 'ledger', icon: <BookOpen className="w-8 h-8" />, ...t.onboarding.steps.ledger },
        { id: 'transaction', icon: <Plus className="w-8 h-8" />, ...t.onboarding.steps.transaction },
        { id: 'dashboard', icon: <BarChart3 className="w-8 h-8" />, ...t.onboarding.steps.dashboard },
        { id: 'analytics', icon: <BarChart3 className="w-8 h-8" />, ...t.onboarding.steps.analytics },
        { id: 'settings', icon: <Settings className="w-8 h-8" />, ...t.onboarding.steps.settings },
    ];

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
        if (currentStep < tourSteps.length - 1) {
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

    const step = tourSteps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === tourSteps.length - 1;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 z-50 animate-fade-in"
                onClick={handleSkip}
            />

            {/* Modal Container - using flexbox for proper centering */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-md pointer-events-auto animate-fade-in">
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
                                {tourSteps.map((_, index) => (
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
                                    {t.onboarding.skip}
                                </button>
                            ) : (
                                <button
                                    onClick={handlePrev}
                                    className="px-4 py-2 text-sm flex items-center gap-1 transition-colors"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    {t.onboarding.prev}
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
                                {isLastStep ? t.onboarding.start : t.onboarding.next}
                                {!isLastStep && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
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
