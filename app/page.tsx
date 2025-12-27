'use client';

import { useFinance } from '@/hooks/useFinance';
import { formatAmount, calculateStats } from '@/lib/calculations';
import { useState, useMemo, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import * as LucideIcons from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css';
import { MonthPicker } from '@/components/MonthPicker';
import { getTransactionsByMonth } from '@/lib/analytics';
import { groupTransactionsByDate } from '@/lib/dateUtils';
import { DateGroup } from '@/components/DateGroup';

export default function Home() {
  const {
    transactions,
    categories,
    addTransaction,
    deleteTransaction,
    isLoading,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // 篩選當月交易
  const monthlyTransactions = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1;
    return getTransactionsByMonth(transactions, year, month);
  }, [transactions, selectedMonth]);

  // 計算當月統計
  const monthlyStats = useMemo(() => {
    return calculateStats(monthlyTransactions);
  }, [monthlyTransactions]);

  // 按日期分組交易
  const groupedTransactions = useMemo(() => {
    const sorted = [...monthlyTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const groups = groupTransactionsByDate(sorted);
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [monthlyTransactions]);

  // 根據類型篩選分類
  const availableCategories = categories.filter(
    (cat) => cat.type === type || cat.type === 'both'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (isNaN(amountInCents) || amountInCents <= 0) {
      alert('請輸入有效金額');
      return;
    }

    if (!selectedCategory) {
      alert('請選擇分類');
      return;
    }

    addTransaction({
      type,
      amount: amountInCents,
      category: selectedCategory,
      date: selectedDate.toISOString(),
      note: note || undefined,
    });

    // 重置表單
    setAmount('');
    setNote('');
    setSelectedCategory('');
    setSelectedDate(new Date());
    setIsModalOpen(false);
  };

  // 當類型改變時，重置分類選擇
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setSelectedCategory('');
  };

  // 渲染分類圖標
  const CategoryIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
    const Icon = (LucideIcons as any)[iconName];
    if (!Icon) return null;
    return <Icon size={16} className={className} />;
  };

  // 監聽來自 Navigation 的新增事件
  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('openAddModal', handleOpenModal);
    return () => window.removeEventListener('openAddModal', handleOpenModal);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主要內容 */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* 月份選擇器 */}
        <MonthPicker selectedDate={selectedMonth} onChange={setSelectedMonth} />

        {/* 統計卡片 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="text-sm text-gray-500 mb-2">當月餘額</div>
          <div className={`text-4xl font-bold mb-6 ${monthlyStats.balance >= 0 ? 'text-gray-900' : 'text-red-600'
            }`}>
            {formatAmount(monthlyStats.balance).replace('NT$', '$')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-xs text-gray-500">收入</span>
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatAmount(monthlyStats.totalIncome).replace('NT$', '$')}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={16} className="text-red-600" />
                <span className="text-xs text-gray-500">支出</span>
              </div>
              <div className="text-lg font-semibold text-red-600">
                {formatAmount(monthlyStats.totalExpense).replace('NT$', '-$')}
              </div>
            </div>
          </div>
        </div>

        {/* 交易列表 */}
        <div>
          {groupedTransactions.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-600 mb-2">尚無交易記錄</div>
              <div className="text-sm text-gray-400">點擊底部的 + 按鈕新增第一筆交易</div>
            </div>
          ) : (
            <div>
              {groupedTransactions.map(([date, trans]) => (
                <DateGroup
                  key={date}
                  date={date}
                  transactions={trans}
                  categories={categories}
                  onDelete={deleteTransaction}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 新增交易 Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory('');
        }}
        title="新增交易"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 類型選擇 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${type === 'expense'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${type === 'income'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              收入
            </button>
          </div>

          {/* 分類選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              分類
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 rounded-xl border transition-all ${selectedCategory === category.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <CategoryIcon iconName={category.icon} className={selectedCategory === category.id ? 'text-white' : 'text-gray-600'} />
                    <span className="text-xs font-medium">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 金額輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              金額
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* 日期選擇 */}
          <div>
            <label className="block text-sm font-medium text gray-700 mb-2">
              日期
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date || new Date())}
              dateFormat="yyyy/MM/dd"
              className="date-picker-input"
              calendarClassName="dark-calendar"
              placeholderText="選擇日期"
              showPopperArrow={false}
              required
            />
          </div>

          {/* 備註輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備註（選填）
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：午餐、薪資..."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* 提交按鈕 */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            新增交易
          </button>
        </form>
      </Modal>
    </div>
  );
}
