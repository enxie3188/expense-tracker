'use client';

import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { useFinance } from '@/hooks/useFinance';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo, useState, forwardRef } from 'react';
import { TrendingUp, TrendingDown, Calendar, Trash2, ChevronDown, Plus, Pencil, ImageIcon, X } from 'lucide-react';
import { format, isSameMonth } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import { TradingForm } from '@/components/TradingForm';
import { usePathname } from 'next/navigation';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useSettings } from '@/hooks/useSettings';
import { SwipeableCard } from '@/components/SwipeableCard';
import { Transaction, TradingTransaction } from '@/types';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('zh-TW', zhTW);
registerLocale('en-US', enUS);

const DateSelectButton = forwardRef<HTMLButtonElement, any>(({ value, onClick }, ref) => (
  <button
    className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] px-3 py-1 rounded-lg transition-colors cursor-pointer"
    onClick={onClick}
    ref={ref}
  >
    {value}
    <ChevronDown size={20} className="text-[var(--text-secondary)]" />
  </button>
));
DateSelectButton.displayName = 'DateSelectButton';

export default function TransactionsPage() {
  const { settings } = useSettings();
  const { t, lang } = useTranslation();
  const { ledgers, transactions, strategies, deleteTransaction, updateTransaction } = useFinance();
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; symbol: string } | null>(null);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | TradingTransaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | TradingTransaction | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [previewImage, setPreviewImage] = useState<{ src: string; txId: string; index: number } | null>(null);

  // 篩選 (Ledger + Month)
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Ledger Filter
    if (selectedLedgerId !== 'all') {
      filtered = filtered.filter((t) => t.ledgerId === selectedLedgerId);
    }

    // Date Filter
    filtered = filtered.filter(t => isSameMonth(new Date(t.date), selectedMonth));

    return filtered;
  }, [transactions, selectedLedgerId, selectedMonth]);

  // 按日期排序
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredTransactions]);

  const currentLedger = ledgers.find((l) => l.id === selectedLedgerId);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { dateKey: string; dateObj: Date; totalPnL: number; transactions: Transaction[] }[] = [];

    sortedTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      const dateKey = format(date, 'yyyy-MM-dd');

      let lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.dateKey !== dateKey) {
        lastGroup = {
          dateKey,
          dateObj: date,
          totalPnL: 0,
          transactions: [],
        };
        groups.push(lastGroup);
      }

      lastGroup.transactions.push(tx);
      // Calculate Total PnL
      if ('pnl' in tx && typeof (tx as any).pnl === 'number') {
        lastGroup.totalPnL += (tx as any).pnl;
      } else if ('amount' in tx && typeof (tx as any).amount === 'number') {
        // Handle regular transactions (expense/income)
        // Amount is in cents, convert to unit
        const val = (tx as any).amount / 100;
        lastGroup.totalPnL += (tx as any).type === 'expense' ? -val : val;
      }
    });

    return groups;
  }, [sortedTransactions]);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (dateKey: string) => {
    const newSet = new Set(collapsedGroups);
    if (newSet.has(dateKey)) {
      newSet.delete(dateKey);
    } else {
      newSet.add(dateKey);
    }
    setCollapsedGroups(newSet);
  };

  // 格式化日期時間使用用戶設定
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const datePattern = settings.appearance.dateFormat.replace('yyyy', 'y').replace('MM', 'M').replace('dd', 'd');
    const timePattern = settings.appearance.timeFormat === '12h' ? 'hh:mm a' : 'HH:mm';
    return format(date, `${datePattern} ${timePattern}`, { locale: lang === 'zh-TW' ? zhTW : enUS });
  };

  const handleDelete = (id: string, symbol: string) => {
    setConfirmDelete({ id, symbol });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24 lg:pb-8 w-full">
      <div className="px-4 lg:px-8 py-8 pt-16 lg:pt-8 max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6 relative">
          <h1 className="text-3xl font-bold mb-2">{t.transactions.title}</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {t.transactions.viewHistory}
          </p>

          {/* Add Transaction Button - Desktop Only */}
          <button
            onClick={() => {
              // Scroll to top and trigger add - need to pass through layout
              window.dispatchEvent(new CustomEvent('openAddTransaction'));
            }}
            className="hidden lg:flex absolute top-0 right-0 items-center gap-2 px-4 py-2 bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-white rounded-lg transition-colors shadow-lg"
          >
            <Plus size={20} />
            {t.common.add}
          </button>
        </div>

        {/* Ledger Tabs */}
        <div className="mb-6 border-b border-[var(--border-default)]">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedLedgerId('all')}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedLedgerId === 'all'
                ? 'bg-[var(--neon-blue)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
            >
              {t.analytics.allLedgers}
            </button>
            {ledgers.map((ledger) => (
              <button
                key={ledger.id}
                onClick={() => setSelectedLedgerId(ledger.id)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${selectedLedgerId === ledger.id
                  ? 'bg-[var(--neon-blue)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ledger.color }}
                />
                {ledger.name}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Count & Date Filter */}
        <div className="mb-4 flex items-center justify-between relative">
          <p className="text-[var(--text-secondary)] text-sm">
            <span className="hidden md:inline">
              {currentLedger && selectedLedgerId !== 'all' ? `${currentLedger.name} • ` : ''}
            </span>
            {sortedTransactions.length} {t.transactions.countSuffix}
          </p>

          <div className="absolute left-1/2 -translate-x-1/2 z-20">
            <DatePicker
              selected={selectedMonth}
              onChange={(date: Date | null) => date && setSelectedMonth(date)}
              dateFormat="yyyy/MM"
              showMonthYearPicker
              locale={lang === 'zh-TW' ? 'zh-TW' : 'en-US'}
              customInput={<DateSelectButton />}
              calendarClassName="month-grid-fix"
            />
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {sortedTransactions.length === 0 ? (
            <div className="card-dark p-12 text-center">
              <p className="text-[var(--text-muted)] mb-4">{t.common.noData}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                <span className="lg:hidden">{t.transactions.clickAdd}</span>
                <span className="hidden lg:inline">{t.transactions.clickAddDesktop}</span>
              </p>
            </div>
          ) : (
            groupedTransactions.map((group) => {
              const isCollapsed = collapsedGroups.has(group.dateKey);
              const dateDisplay = format(group.dateObj, 'MM/dd (eee)', { locale: lang === 'zh-TW' ? zhTW : enUS });

              return (
                <div key={group.dateKey} className="mb-6">
                  {/* Group Header */}
                  <div
                    className="flex items-center justify-between px-3 py-2 bg-[var(--bg-secondary)] rounded-lg cursor-pointer mb-2 select-none hover:bg-[var(--bg-hover)] transition-colors"
                    onClick={() => toggleGroup(group.dateKey)}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown
                        size={16}
                        className={`text-[var(--text-secondary)] transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''
                          }`}
                      />
                      <span className="font-medium text-[var(--text-secondary)]">{dateDisplay}</span>
                    </div>
                    <span
                      className={`font-semibold ${group.totalPnL > 0
                        ? 'text-[var(--neon-green)]'
                        : group.totalPnL < 0
                          ? 'text-[var(--neon-pink)]'
                          : 'text-[var(--text-secondary)]'
                        }`}
                    >
                      {group.totalPnL > 0 ? '+' : ''}
                      {group.totalPnL.toLocaleString()}
                    </span>
                  </div>

                  {/* Transactions List */}
                  {!isCollapsed && (
                    <div className="space-y-3">
                      {group.transactions.map((tx) => {
                        // 判斷是舊格式還是新格式
                        const isTrading = 'pnl' in tx && tx.pnl !== undefined;
                        const strategy = strategies.find((s) =>
                          'strategyId' in tx && s.id === (tx as any).strategyId
                        );

                        const isExpanded = expandedTxId === tx.id;

                        return (
                          <SwipeableCard
                            key={tx.id}
                            onDelete={() => handleDelete(tx.id, (tx as any).ticker || (tx as any).category || 'Unknown')}
                          >
                            <div className="card-dark transition-all relative group">
                              {/* Main Card - Clickable */}
                              <div
                                className="p-5 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors relative"
                                onClick={() => {
                                  // 手機版：點擊開啟詳情視窗 (Detail View)
                                  if (window.innerWidth < 768) {
                                    setViewingTransaction(tx);
                                  } else {
                                    // 桌面版：展開備註
                                    setExpandedTxId(isExpanded ? null : tx.id);
                                  }
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  {/* Left: Info */}
                                  <div className="flex-1">
                                    {isTrading ? (
                                      <>
                                        {/* Trading Transaction */}
                                        <div className="flex items-center gap-2 mb-2">
                                          {(tx as any).type === 'long' ? (
                                            <TrendingUp size={18} className="text-[var(--neon-green)]" />
                                          ) : (
                                            <TrendingDown size={18} className="text-[var(--neon-pink)]" />
                                          )}
                                          <span className="font-semibold text-lg">
                                            {(tx as any).ticker || 'Unknown'}
                                          </span>
                                          <span className="text-xs px-2 py-1 rounded bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                                            {(tx as any).type === 'long' ? t.tradingForm.long : t.tradingForm.short}
                                          </span>
                                        </div>

                                        <div className="text-sm text-[var(--text-secondary)] space-y-1">
                                          <div>
                                            {t.tradingForm.quantity}: {(tx as any).quantity} @{' '}
                                            {(tx as any).entryPrice} → {(tx as any).exitPrice}
                                          </div>
                                          {strategy && (
                                            <div className="flex items-center gap-1">
                                              <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: strategy.color }}
                                              />
                                              <span>{strategy.name}</span>
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        {/* Old Transaction Format */}
                                        <div className="font-semibold text-lg mb-1">
                                          {(tx as any).category}
                                        </div>
                                      </>
                                    )}

                                    {/* Date with Expand Indicator */}
                                    <div className="mt-2">
                                      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                        <Calendar size={12} />
                                        {formatDateTime(tx.date)}
                                      </div>
                                      {(tx as any).images?.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-[var(--neon-blue)] mt-1">
                                          <ImageIcon size={12} />
                                          {(tx as any).images.length}
                                        </div>
                                      )}
                                      {tx.note && (
                                        <div className="hidden md:flex items-center justify-center mt-1">
                                          <ChevronDown
                                            size={14}
                                            className={`text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right: Amount/PnL */}
                                  <div className="text-right">
                                    {isTrading ? (
                                      <div
                                        className={`text-2xl font-bold ${(tx as any).pnl >= 0
                                          ? 'text-[var(--neon-green)]'
                                          : 'text-[var(--neon-pink)]'
                                          }`}
                                      >
                                        {(tx as any).pnl >= 0 ? '+' : ''}
                                        {(tx as any).pnl?.toFixed(0)}
                                      </div>
                                    ) : (
                                      <div
                                        className={`text-2xl font-bold ${(tx as any).type === 'income'
                                          ? 'text-[var(--neon-green)]'
                                          : 'text-[var(--neon-pink)]'
                                          }`}
                                      >
                                        {(tx as any).type === 'income' ? '+' : '-'}
                                        {((tx as any).amount / 100).toFixed(0)}
                                      </div>
                                    )}

                                    {isTrading && (tx as any).commission > 0 && (
                                      <div className="text-xs text-[var(--text-muted)] mt-1">
                                        {t.transactions.commission}: {(tx as any).commission}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons - Bottom Right of main content (Desktop only) */}
                                <div className="hidden lg:flex absolute bottom-3 right-3 gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingTransaction(tx);
                                    }}
                                    className="p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--neon-blue)]/20 text-[var(--text-muted)] hover:text-[var(--neon-blue)] transition-all"
                                    title="編輯交易"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(tx.id, (tx as any).ticker || (tx as any).category || 'Unknown');
                                    }}
                                    className="p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-500 transition-all"
                                    title="刪除交易"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Details */}
                              {isExpanded && tx.note && (
                                <div className="px-5 pb-5 border-t border-[var(--border-subtle)] pt-4 mt-2">
                                  <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                    📝 備註
                                  </h4>
                                  <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap bg-[var(--bg-hover)] p-4 rounded-lg">
                                    {tx.note}
                                  </div>
                                </div>
                              )}

                              {/* Expanded Images */}
                              {isExpanded && (tx as any).images?.length > 0 && (
                                <div className="px-5 pb-5 border-t border-[var(--border-subtle)] pt-4 mt-2">
                                  <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                    📷 附件
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(tx as any).images.map((img: string, i: number) => (
                                      <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[var(--border-default)] cursor-pointer hover:opacity-90">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={img}
                                          alt={`Attachment ${i}`}
                                          className="w-full h-full object-cover"
                                          onClick={() => setPreviewImage({ src: img, txId: tx.id, index: i })}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </SwipeableCard>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete !== null}
        title={t.transactions.deleteConfirmTitle}
        message={t.transactions.deleteConfirmMessage.replace('{symbol}', confirmDelete?.symbol || '')}
        onConfirm={() => {
          if (confirmDelete) {
            deleteTransaction(confirmDelete.id);
            setConfirmDelete(null);
          }
        }}
        onCancel={() => {
          setConfirmDelete(null);
        }}
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
      />

      {/* Edit Transaction Modal */}
      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={viewingTransaction !== null}
        onClose={() => setViewingTransaction(null)}
        transaction={viewingTransaction ? transactions.find(t => t.id === viewingTransaction.id) || viewingTransaction : null}
        ledgerName={viewingTransaction ? ledgers.find(l => l.id === viewingTransaction.ledgerId)?.name : undefined}
        strategyName={viewingTransaction && 'strategyId' in viewingTransaction ? strategies.find(s => s.id === (viewingTransaction as any).strategyId)?.name : undefined}
        onEdit={(tx) => {
          // Keep detail view open (don't setViewingTransaction(null))
          setEditingTransaction(tx);
        }}
        onDelete={(tx) => {
          setViewingTransaction(null);
          setConfirmDelete({
            id: tx.id,
            symbol: (tx as any).ticker || (tx as any).category || 'Unknown'
          });
        }}
        onUpdateImages={(txId, newImages) => {
          updateTransaction(txId, { images: newImages } as any);
        }}
      />

      {/* Edit Transaction Modal (Placed AFTER DetailModal to show on top) */}
      <TradingForm
        isOpen={isFormOpen || editingTransaction !== null}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        editTransaction={editingTransaction as any}
      />

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const tx = transactions.find(t => t.id === previewImage.txId);
              if (tx && (tx as any).images) {
                const newImages = (tx as any).images.filter((_: string, idx: number) => idx !== previewImage.index);
                updateTransaction(previewImage.txId, { images: newImages } as any);
              }
              setPreviewImage(null);
            }}
            className="absolute top-4 left-4 p-3 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors z-10"
            aria-label="Delete"
          >
            <Trash2 size={24} />
          </button>

          <div
            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage.src}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            點擊任意處關閉
          </div>
        </div>
      )}
    </div>
  );
}
