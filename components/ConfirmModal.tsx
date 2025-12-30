'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/hooks/useTranslation';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText,
    cancelText
}: ConfirmModalProps) {
    const { t } = useTranslation();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen) return null;
    if (!mounted) return null;

    const finalConfirmText = confirmText || t.common.confirm;
    const finalCancelText = cancelText || t.common.cancel;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                    {title}
                </h3>
                <p className="text-[var(--text-secondary)] mb-6">
                    {message}
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
                    >
                        {finalCancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                    >
                        {finalConfirmText}
                    </button>
                </div>
            </div>
        </div>
        , document.body);
}
