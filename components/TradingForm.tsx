'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useTranslation } from '@/hooks/useTranslation';
import { Modal } from '@/components/ui/Modal';
import { TrendingUp, TrendingDown, DollarSign, Hash, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { calculatePnL } from '@/lib/ledgerManager';
import { getFuturesSpec } from '@/lib/futuresSpecs';
import { Transaction } from '@/types';
import { ImageUploader } from '@/components/ImageUploader';

interface TradingFormProps {
    isOpen: boolean;
    onClose: () => void;
    editTransaction?: Transaction | null; // 如果有值則為編輯模式
}

export function TradingForm({ isOpen, onClose, editTransaction }: TradingFormProps) {
    const { ledgers, strategies, addTransaction, updateTransaction } = useFinance();
    const { t } = useTranslation();

    // Form state
    const [ledgerId, setLedgerId] = useState('');
    const [strategyId, setStrategyId] = useState('');
    const [type, setType] = useState<'long' | 'short'>('long');
    const [ticker, setTicker] = useState('');
    const [quantity, setQuantity] = useState(''); // 股數/口數/幣數量
    const [positionValue, setPositionValue] = useState(''); // 總倉位價值（加密貨幣用）
    const [entryPrice, setEntryPrice] = useState('');
    const [exitPrice, setExitPrice] = useState('');
    const [pointValue, setPointValue] = useState('1');
    const [commission, setCommission] = useState('0');
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const selectedLedger = useMemo(() => {
        return ledgers.find((l) => l.id === ledgerId);
    }, [ledgers, ledgerId]);

    // 期貨：自動帶入點值
    useEffect(() => {
        if (selectedLedger?.assetType === 'futures' && ticker) {
            const spec = getFuturesSpec(ticker);
            if (spec) {
                setPointValue(spec.pointValue.toString());
            }
        }
    }, [ticker, selectedLedger]);

    // 加密貨幣：根據總倉位價值計算幣數量
    useEffect(() => {
        if (selectedLedger?.assetType === 'crypto' && positionValue && entryPrice) {
            const pv = parseFloat(positionValue);
            const entry = parseFloat(entryPrice);
            if (!isNaN(pv) && !isNaN(entry) && entry > 0) {
                const calculatedQty = pv / entry;
                setQuantity(calculatedQty.toFixed(6));
            }
        }
    }, [positionValue, entryPrice, selectedLedger]);

    // 編輯模式：預填表單
    useEffect(() => {
        if (editTransaction && isOpen) {
            const tx = editTransaction as any;
            setLedgerId(tx.ledgerId || '');
            setStrategyId(tx.strategyId || '');
            setType(tx.type || 'long');
            setTicker(tx.ticker || '');
            setQuantity(tx.quantity?.toString() || '');
            setEntryPrice(tx.entryPrice?.toString() || '');
            setExitPrice(tx.exitPrice?.toString() || '');
            setPointValue(tx.pointValue?.toString() || '1');
            setCommission(tx.commission?.toString() || '0');
            setDate(tx.date ? new Date(tx.date) : new Date());
            setNote(tx.note || '');
            setImages(tx.images || []);

            // 計算並設定總倉位價值 (主要用於加密貨幣編輯模式)
            if (tx.quantity && tx.entryPrice) {
                const qty = parseFloat(tx.quantity);
                const entry = parseFloat(tx.entryPrice);
                if (!isNaN(qty) && !isNaN(entry)) {
                    // 對於顯示，通常保留 2 位小數即可，避免浮點數誤差顯示過長
                    setPositionValue((qty * entry).toFixed(2));
                }
            }
        } else if (!isOpen) {
            // 關閉時重置
            resetForm();
        }
    }, [editTransaction, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!ledgerId) {
            alert(t.analytics.selectLedger);
            return;
        }

        if (!ticker.trim()) {
            alert(t.tradingForm.validation.symbolRequired);
            return;
        }

        const qty = parseFloat(quantity);
        const entry = parseFloat(entryPrice);
        const exit = parseFloat(exitPrice);
        const pv = parseFloat(pointValue);
        const comm = parseFloat(commission);

        if (isNaN(qty) || isNaN(entry) || isNaN(exit) || isNaN(pv) || isNaN(comm)) {
            alert(t.tradingForm.validation.priceRequired);
            return;
        }

        // 計算 PnL
        const pnl = calculatePnL(entry, exit, qty, type, pv, comm);

        const transactionData = {
            ledgerId,
            strategyId: strategyId || undefined,
            type,
            ticker: ticker.trim(),
            quantity: qty,
            entryPrice: entry,
            exitPrice: exit,
            pointValue: pv,
            commission: comm,
            pnl,
            date: date.toISOString(),
            note: note.trim() || undefined,
            images,
        };

        try {
            if (editTransaction) {
                // 編輯模式：更新現有交易
                await updateTransaction(editTransaction.id, transactionData as any);
            } else {
                // 新增模式
                await addTransaction(transactionData as any);
            }

            // 重置表單
            resetForm();
            onClose();
        } catch (error) {
            console.error('Failed to save transaction:', error);
        }
    };

    const resetForm = () => {
        setLedgerId('');
        setStrategyId('');
        setType('long');
        setTicker('');
        setQuantity('');
        setPositionValue('');
        setEntryPrice('');
        setExitPrice('');
        setPointValue('1');
        setCommission('0');
        setDate(new Date());
        setNote('');
        setImages([]);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editTransaction ? t.tradingForm.editTitle : t.tradingForm.addTitle}>
            <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Row 1: 帳本 + 策略 */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                            {t.settings.ledgerStrategy.ledgers}
                        </label>
                        <select
                            value={ledgerId}
                            onChange={(e) => setLedgerId(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--neon-blue)] focus:outline-none"
                            required
                        >
                            <option value="">{t.transactions.selectLedger}</option>
                            {ledgers.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                            {t.settings.ledgerStrategy.strategies}
                        </label>
                        <select
                            value={strategyId}
                            onChange={(e) => setStrategyId(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--neon-blue)] focus:outline-none"
                        >
                            <option value="">{t.tradingForm.noStrategy}</option>
                            {strategies.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 2: 交易方向 */}
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        {t.tradingForm.direction}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setType('long')}
                            className={`py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${type === 'long'
                                ? 'bg-[var(--neon-green)] text-white'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)]'
                                }`}
                        >
                            <TrendingUp size={14} />
                            {t.tradingForm.long}
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('short')}
                            className={`py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${type === 'short'
                                ? 'bg-[var(--neon-pink)] text-white'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)]'
                                }`}
                        >
                            <TrendingDown size={14} />
                            {t.tradingForm.short}
                        </button>
                    </div>
                </div>

                {/* Row 3: 標的 + 數量/口數/倉位 */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                            {t.tradingForm.symbol}
                        </label>
                        <input
                            type="text"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            placeholder={
                                selectedLedger?.assetType === 'futures' ? 'NQ, ES, TX' :
                                    selectedLedger?.assetType === 'crypto' ? 'BTC, ETH' :
                                        t.tradingForm.symbolPlaceholder
                            }
                            className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-blue)] focus:outline-none"
                            required
                        />
                    </div>

                    {/* 加密貨幣：總倉位價值 */}
                    {selectedLedger?.assetType === 'crypto' ? (
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                                {t.tradingForm.totalValue}
                            </label>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={positionValue}
                                    onChange={(e) => setPositionValue(e.target.value)}
                                    placeholder="10000"
                                    className="w-full pl-8 pr-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-blue)] focus:outline-none"
                                    required
                                />
                            </div>
                            {quantity && (
                                <div className="text-xs text-[var(--text-muted)] mt-1">
                                    ≈ {parseFloat(quantity).toFixed(6)}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* 期貨/股票：口數/股數 */
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                                {selectedLedger?.assetType === 'futures' ? t.tradingForm.contracts : t.tradingForm.quantity}
                            </label>
                            <div className="relative">
                                <Hash size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    type="number"
                                    step={selectedLedger?.assetType === 'futures' ? '1' : '0.001'}
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder={selectedLedger?.assetType === 'futures' ? '1' : '100'}
                                    className="w-full pl-8 pr-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-blue)] focus:outline-none"
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Row 4: 進場價格 + 出場價格 */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                            {t.tradingForm.entryPrice}
                        </label>
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="number"
                                step="0.01"
                                value={entryPrice}
                                onChange={(e) => setEntryPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-8 pr-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-blue)] focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                            {t.tradingForm.exitPrice}
                        </label>
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="number"
                                step="0.01"
                                value={exitPrice}
                                onChange={(e) => setExitPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-8 pr-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-blue)] focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Row 5: 手續費 + 日期 (+ 點值 if futures) */}
                <div className={`grid ${selectedLedger?.assetType === 'futures' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                    {selectedLedger?.assetType === 'futures' && (
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                                {t.tradingForm.pointValue}
                            </label>
                            <input
                                type="number"
                                step="1"
                                value={pointValue}
                                onChange={(e) => setPointValue(e.target.value)}
                                placeholder="50"
                                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-blue)] focus:outline-none"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                            {t.tradingForm.commission}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={commission}
                            onChange={(e) => setCommission(e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-blue)] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                            <Calendar size={12} className="inline mr-1" />
                            {t.tradingForm.date}
                        </label>
                        <DatePicker
                            selected={date}
                            onChange={(d: Date | null) => {
                                if (d) {
                                    // 保留當前時間，只更新日期部分
                                    const now = new Date();
                                    d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
                                    setDate(d);
                                }
                            }}
                            dateFormat="yyyy/MM/dd"
                            className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--neon-blue)] focus:outline-none"
                        />
                    </div>
                </div>

                {/* Row 6: 備註 (全寬) */}
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        {t.transactions.note} <span className="text-[var(--text-muted)] text-xs">(選填)</span>
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t.tradingForm.notePlaceholder}
                        rows={2}
                        className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--neon-blue)] focus:outline-none resize-none"
                    />
                </div>

                {/* Row 7: 圖片上傳 */}
                <div>
                    <ImageUploader
                        images={images}
                        onImagesChange={setImages}
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-2.5 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg font-medium text-sm hover:bg-[var(--bg-hover)] transition-colors"
                    >
                        {t.common.cancel}
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-2.5 px-4 bg-[var(--neon-blue)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                        {editTransaction ? t.tradingForm.submitEdit : t.tradingForm.submit}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
