'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Modal } from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFinance } from "@/hooks/useFinance";
import * as LucideIcons from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <title>極簡記帳 App</title>
        <meta name="description" content="簡單優雅的個人財務管理工具" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { categories, addTransaction } = useFinance();

  const availableCategories = categories.filter(
    (cat) => cat.type === type || cat.type === 'both'
  );

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

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

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setSelectedCategory('');
  };

  const CategoryIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
    const Icon = (LucideIcons as any)[iconName];
    if (!Icon) return null;
    return <Icon size={16} className={className} />;
  };

  return (
    <>
      {children}
      <Navigation onAddClick={handleAddClick} />

      {/* 全域 Modal */}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
    </>
  );
}
