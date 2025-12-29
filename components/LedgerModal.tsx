'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Modal } from '@/components/ui/Modal';
import { Ledger } from '@/types/ledger';
import { Wallet, DollarSign, Palette } from 'lucide-react';

interface LedgerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (ledger: Omit<Ledger, 'id' | 'createdAt'>) => void;
    initialData?: Ledger;
}

const ASSET_TYPES = [
    'crypto',
    'stock-tw',
    'stock-us',
    'futures',
    'forex',
    'other',
] as const;

const COLORS = [
    { value: '#3b82f6', key: 'blue' },
    { value: '#22c55e', key: 'green' },
    { value: '#ec4899', key: 'pink' },
    { value: '#f59e0b', key: 'orange' },
    { value: '#8b5cf6', key: 'purple' },
    { value: '#ef4444', key: 'red' },
] as const;

export function LedgerModal({ isOpen, onClose, onSave, initialData }: LedgerModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState(initialData?.name || '');
    const [assetType, setAssetType] = useState<Ledger['assetType']>(initialData?.assetType || 'other');
    const [initialBalance, setInitialBalance] = useState(initialData?.initialBalance?.toString() || '10000');
    const [color, setColor] = useState(initialData?.color || '#3b82f6');
    const [icon] = useState(initialData?.icon || 'Wallet');

    // 當 initialData 改變時更新表單狀態
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setAssetType(initialData.assetType || 'other');
            setInitialBalance(initialData.initialBalance?.toString() || '10000');
            setColor(initialData.color || '#3b82f6');
        } else {
            // 新增模式，重置表單
            setName('');
            setAssetType('other');
            setInitialBalance('10000');
            setColor('#3b82f6');
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert(t.ledgerModal.validation.nameRequired);
            return;
        }

        const balance = parseFloat(initialBalance);
        if (isNaN(balance) || balance < 0) {
            alert(t.ledgerModal.validation.balanceInvalid);
            return;
        }

        onSave({
            name: name.trim(),
            assetType,
            initialBalance: balance,
            icon,
            color,
        });

        // 重置表單
        setName('');
        setAssetType('other');
        setInitialBalance('10000');
        setColor('#3b82f6');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? t.ledgerModal.editTitle : t.ledgerModal.addTitle}>
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* 帳本名稱 */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        {t.ledgerModal.name}
                    </label>
                    <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.ledgerModal.namePlaceholder}
                            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-blue)] focus:outline-none transition-colors"
                            required
                        />
                    </div>
                </div>

                {/* 資產類型 */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        {t.ledgerModal.assetType}
                    </label>
                    <select
                        value={assetType}
                        onChange={(e) => setAssetType(e.target.value as Ledger['assetType'])}
                        className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] focus:border-[var(--neon-blue)] focus:outline-none transition-colors"
                    >
                        {ASSET_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {t.ledgerModal.assetTypes[type]}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 初始金額 */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        {t.ledgerModal.initialBalance}
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input
                            type="number"
                            step="1"
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(e.target.value)}
                            placeholder="10000"
                            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-blue)] focus:outline-none transition-colors"
                            required
                        />
                    </div>
                </div>

                {/* 顏色選擇 */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        <Palette size={16} className="inline mr-2" />
                        {t.ledgerModal.color}
                    </label>
                    <div className="grid grid-cols-6 gap-3">
                        {COLORS.map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                onClick={() => setColor(c.value)}
                                className={`w-12 h-12 rounded-lg transition-all ${color === c.value
                                    ? 'ring-2 ring-[var(--neon-blue)] ring-offset-2 ring-offset-[var(--bg-primary)] scale-110'
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
                        className="flex-1 py-3 px-4 bg-[var(--neon-blue)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                        {initialData ? t.common.update : t.common.add}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
