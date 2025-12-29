'use client';

import { X, Pencil, Trash2, Calendar, Wallet, FileText, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, TradingTransaction } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | TradingTransaction | null;
    onEdit: (transaction: Transaction | TradingTransaction) => void;
    onDelete: (transaction: Transaction | TradingTransaction) => void;
    ledgerName?: string;
    strategyName?: string;
}

// Helper to check if transaction is trading type
function isTradingTransaction(tx: Transaction | TradingTransaction): tx is TradingTransaction {
    return 'pnl' in tx;
}

export function TransactionDetailModal({
    isOpen,
    onClose,
    transaction,
    onEdit,
    onDelete,
    ledgerName,
    strategyName
}: TransactionDetailModalProps) {
    const { t, lang } = useTranslation();

    if (!isOpen || !transaction) return null;

    const isTrading = isTradingTransaction(transaction);
    const dateObj = new Date(transaction.date);
    const formattedDate = format(dateObj, 'yyyy年MM月dd日 eeee HH:mm', { locale: lang === 'zh-TW' ? zhTW : enUS });

    // Helper to format currency
    const formatCurrency = (val: number) => val.toLocaleString();

    // Determine header color/icon based on type/pnl
    let headerColor = 'text-[var(--text-primary)]';
    let amountDisplay = '';

    if (isTrading) {
        if (transaction.pnl && transaction.pnl > 0) headerColor = 'text-[var(--neon-green)]';
        else if (transaction.pnl && transaction.pnl < 0) headerColor = 'text-[var(--neon-pink)]';

        amountDisplay = transaction.pnl ? (transaction.pnl > 0 ? `+${formatCurrency(transaction.pnl)}` : formatCurrency(transaction.pnl)) : '0';
    } else {
        const tx = transaction as Transaction; // Expense/Income
        if (tx.type === 'income') headerColor = 'text-[var(--neon-green)]';
        else headerColor = 'text-[var(--neon-pink)]';

        // Expense is usually negative in display? Or just amount? 
        // Based on user screenshot "$80" red (expense).
        amountDisplay = formatCurrency(tx.amount);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header - Title & Close */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                    <h3 className="text-lg font-bold text-[var(--text-secondary)]">
                        {t.common.details || '記錄明細'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto">

                    {/* Details List */}
                    <div className="space-y-0 text-sm">
                        {/* PnL / Amount (Moved to top row) */}
                        <DetailRow
                            label={isTrading ? (t.dashboard?.totalChange || '損益') : ('金額')}
                            value={`$${amountDisplay}`}
                            icon={isTrading ? <TrendingUp size={16} /> : <Wallet size={16} />}
                            valueColor={`text-lg font-bold ${headerColor}`}
                        />

                        {/* Type / Symbol */}
                        <DetailRow
                            label={isTrading ? (t.tradingForm.symbol || 'Symbol') : ('類別')}
                            value={isTrading ? ((transaction as TradingTransaction).symbol || (transaction as TradingTransaction).ticker || 'Unknown') : (transaction as Transaction).category}
                            icon={isTrading ? <Tag size={16} /> : <Tag size={16} />}
                        />

                        {/* Strategy (Trading Only) */}
                        {isTrading && strategyName && (
                            <DetailRow
                                label={t.tradingForm.strategy || 'Strategy'}
                                value={strategyName}
                                icon={<TargetIcon />}
                            />
                        )}

                        {/* Date */}
                        <DetailRow
                            label={t.tradingForm.date || 'Date'}
                            value={formattedDate}
                            icon={<Calendar size={16} />}
                        />

                        {/* Ledger */}
                        {ledgerName && (
                            <DetailRow
                                label={t.analytics.selectLedger?.replace('Select ', '') || '帳冊'}
                                value={ledgerName}
                                icon={<Wallet size={16} />}
                                valueColor="text-[var(--neon-pink)]"
                            />
                        )}

                        {/* Note */}
                        {(transaction.note) && (
                            <div className="py-4 border-b border-[var(--border-subtle)]">
                                <div className="flex items-center gap-2 mb-2 text-[var(--text-secondary)]">
                                    <FileText size={16} />
                                    <span>{t.tradingForm.note || 'Notes'}:</span>
                                </div>
                                <div className="pl-6 text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                                    {transaction.note}
                                </div>
                            </div>
                        )}

                        {/* Images */}
                        {((transaction as any).images?.length > 0) && (
                            <div className="py-4 border-b border-[var(--border-subtle)]">
                                <div className="flex items-center gap-2 mb-3 text-[var(--text-secondary)]">
                                    <span>📷 {t.common.images || '附件'}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(transaction as any).images.map((img: string, i: number) => (
                                        <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[var(--border-default)] cursor-pointer hover:opacity-90 transition-opacity">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={img}
                                                alt={`Img ${i}`}
                                                className="w-full h-full object-cover"
                                                onClick={() => {
                                                    const win = window.open();
                                                    win?.document.write(`<img src="${img}" style="max-width:100%">`);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex gap-3">
                    <button
                        onClick={() => onDelete(transaction)}
                        className="flex-1 py-3 px-4 bg-[var(--neon-pink)]/10 hover:bg-[var(--neon-pink)] text-[var(--neon-pink)] hover:text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200"
                    >
                        <Trash2 size={18} />
                        {t.common.delete}
                    </button>
                    <button
                        onClick={() => onEdit(transaction)}
                        className="flex-1 py-3 px-4 bg-[var(--neon-blue)]/10 hover:bg-[var(--neon-blue)] text-[var(--neon-blue)] hover:text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200"
                    >
                        <Pencil size={18} />
                        {t.common.edit}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, icon, valueColor = 'text-[var(--text-primary)]' }: { label: string, value: string, icon?: React.ReactNode, valueColor?: string }) {
    return (
        <div className="flex justify-between items-center py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                {icon}
                <span>{label}:</span>
            </div>
            <div className={`font-medium ${valueColor} text-right`}>
                {value}
            </div>
        </div>
    );
}

function TargetIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
    )
}
