'use client';

import React from 'react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
}

/**
 * 空狀態組件 - 當沒有資料時顯示引導
 */
export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 animate-fade-in">
            {/* Icon */}
            <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--neon-blue)',
                }}
            >
                {icon}
            </div>

            {/* Title */}
            <h2
                className="text-2xl font-bold mb-3 text-center"
                style={{ color: 'var(--text-primary)' }}
            >
                {title}
            </h2>

            {/* Description */}
            <p
                className="text-center max-w-md mb-8 leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
            >
                {description}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="px-8 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))',
                            color: 'white',
                            boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
                        }}
                    >
                        {actionLabel}
                    </button>
                )}

                {secondaryActionLabel && onSecondaryAction && (
                    <button
                        onClick={onSecondaryAction}
                        className="px-8 py-3 rounded-xl font-medium transition-all"
                        style={{
                            backgroundColor: 'var(--bg-hover)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                        }}
                    >
                        {secondaryActionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * 預設的「無帳本」空狀態
 */
interface NoLedgerStateProps {
    onCreateLedger: () => void;
}

export function NoLedgerState({ onCreateLedger }: NoLedgerStateProps) {
    return (
        <EmptyState
            icon={
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
            }
            title="歡迎來到 AlphaLog！"
            description="準備開始記錄您的交易旅程嗎？創建第一個帳本，開始追蹤您的每一筆交易和績效。"
            actionLabel="✨ 創建第一個帳本"
            onAction={onCreateLedger}
        />
    );
}

/**
 * 預設的「無交易」空狀態
 */
interface NoTransactionStateProps {
    onAddTransaction: () => void;
}

export function NoTransactionState({ onAddTransaction }: NoTransactionStateProps) {
    return (
        <EmptyState
            icon={
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
            }
            title="尚無交易資料"
            description="開始記錄您的第一筆交易，查看您的權益曲線和績效分析。"
            actionLabel="+ 新增交易"
            onAction={onAddTransaction}
        />
    );
}
