'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Modal } from '@/components/ui/Modal';
import { Strategy } from '@/types/ledger';
import { Target, FileText, Palette } from 'lucide-react';

interface StrategyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => void;
    initialData?: Strategy;
}

const COLORS = [
    { value: '#22c55e', key: 'green' },
    { value: '#3b82f6', key: 'blue' },
    { value: '#ec4899', key: 'pink' },
    { value: '#f59e0b', key: 'orange' },
    { value: '#8b5cf6', key: 'purple' },
    { value: '#ef4444', key: 'red' },
] as const;

export function StrategyModal({ isOpen, onClose, onSave, initialData }: StrategyModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [color, setColor] = useState(initialData?.color || '#22c55e');

    // 當 initialData 改變時更新表單狀態
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setColor(initialData.color || '#22c55e');
        } else {
            // 新增模式，重置表單
            setName('');
            setDescription('');
            setColor('#22c55e');
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert(t.strategyModal.validation.nameRequired);
            return;
        }

        onSave({
            name: name.trim(),
            description: description.trim() || undefined,
            color,
        });

        // 重置表單
        setName('');
        setDescription('');
        setColor('#22c55e');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? t.strategyModal.editTitle : t.strategyModal.addTitle}>
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* 策略名稱 */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        {t.strategyModal.name}
                    </label>
                    <div className="relative">
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.strategyModal.namePlaceholder}
                            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-green)] focus:outline-none transition-colors"
                            required
                        />
                    </div>
                </div>

                {/* 策略說明 */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        {t.strategyModal.description}
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 text-[var(--text-secondary)]" size={18} />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t.strategyModal.descriptionPlaceholder}
                            rows={4}
                            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-green)] focus:outline-none transition-colors resize-none"
                        />
                    </div>
                </div>

                {/* 顏色選擇 */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        <Palette size={16} className="inline mr-2" />
                        {t.strategyModal.color}
                    </label>
                    <div className="grid grid-cols-6 gap-3">
                        {COLORS.map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                onClick={() => setColor(c.value)}
                                className={`w-12 h-12 rounded-lg transition-all ${color === c.value
                                    ? 'ring-2 ring-[var(--neon-green)] ring-offset-2 ring-offset-[var(--bg-primary)] scale-110'
                                    : 'hover:scale-105'
                                    }`}
                                style={{ backgroundColor: c.value }}
                                title={t.colors[c.key as keyof typeof t.colors]}
                            />
                        ))}
                    </div>
                </div>

                {/* 提交按鈕 */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition-colors"
                    >
                        {t.common.cancel}
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3 px-4 bg-[var(--neon-green)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                        {initialData ? t.common.update : t.common.add}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
