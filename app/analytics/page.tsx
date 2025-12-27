'use client';

import { useFinance } from '@/hooks/useFinance';
import { useState, useMemo } from 'react';
import { MonthPicker } from '@/components/MonthPicker';
import {
    getTransactionsByMonth,
    getTransactionsByYear,
    getExpensesByCategory,
    getIncomeByCategory,
    getMonthlyStats
} from '@/lib/analytics';
import { formatAmount } from '@/lib/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import './charts.css';

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'];

export default function AnalyticsPage() {
    const { transactions, categories } = useFinance();
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1;

    // 月度數據
    const monthlyTransactions = useMemo(
        () => getTransactionsByMonth(transactions, year, month),
        [transactions, year, month]
    );

    const expensesByCategory = useMemo(
        () => getExpensesByCategory(monthlyTransactions),
        [monthlyTransactions]
    );

    const incomesByCategory = useMemo(
        () => getIncomeByCategory(monthlyTransactions),
        [monthlyTransactions]
    );

    // 年度數據
    const yearlyStats = useMemo(
        () => getMonthlyStats(transactions, year),
        [transactions, year]
    );

    // 準備圖表數據
    const expenseChartData = useMemo(() => {
        return Object.entries(expensesByCategory).map(([categoryId, amount]) => {
            const category = categories.find((c) => c.id === categoryId);
            return {
                name: category?.name || '未知',
                value: amount / 100,
                amount: amount,
            };
        }).sort((a, b) => b.value - a.value);
    }, [expensesByCategory, categories]);

    const incomeChartData = useMemo(() => {
        return Object.entries(incomesByCategory).map(([categoryId, amount]) => {
            const category = categories.find((c) => c.id === categoryId);
            return {
                name: category?.name || '未知',
                value: amount / 100,
                amount: amount,
            };
        }).sort((a, b) => b.value - a.value);
    }, [incomesByCategory, categories]);

    const monthlyChartData = useMemo(() => {
        return yearlyStats.map(stat => ({
            ...stat,
            income: stat.income / 100,
            expense: stat.expense / 100,
        }));
    }, [yearlyStats]);

    const totalExpense = monthlyTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = monthlyTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* 標題 */}
                <h1 className="text-3xl font-bold mb-8 text-gray-900">財務分析</h1>

                {/* 視圖切換 */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setViewMode('monthly')}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${viewMode === 'monthly'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        月度報表
                    </button>
                    <button
                        onClick={() => setViewMode('yearly')}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${viewMode === 'yearly'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        年度報表
                    </button>
                </div>

                {viewMode === 'monthly' ? (
                    <>
                        {/* 月份選擇器 */}
                        <MonthPicker selectedDate={selectedMonth} onChange={setSelectedMonth} />

                        {/* 月度統計卡片 */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={20} className="text-green-600" />
                                    <span className="text-sm text-gray-600">本月收入</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatAmount(totalIncome)}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown size={20} className="text-red-600" />
                                    <span className="text-sm text-gray-600">本月支出</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600">
                                    {formatAmount(totalExpense)}
                                </div>
                            </div>
                        </div>

                        {/* 支出分類圓餅圖 */}
                        {expenseChartData.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900">支出分類分布</h2>
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={expenseChartData}
                                            cx="50%"
                                            cy="45%"
                                            labelLine={false}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {expenseChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => `NT$${value.toLocaleString()}`}
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }}
                                            labelStyle={{ color: '#ffffff' }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            wrapperStyle={{ color: '#ffffff', fontSize: '14px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* 收入分類圓餅圖 */}
                        {incomeChartData.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900">收入分類分布</h2>
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={incomeChartData}
                                            cx="50%"
                                            cy="45%"
                                            labelLine={false}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {incomeChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => `NT$${value.toLocaleString()}`}
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }}
                                            labelStyle={{ color: '#ffffff' }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            wrapperStyle={{ color: '#ffffff', fontSize: '14px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* 年度視圖 */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">{year}年 收支趨勢</h2>
                        </div>

                        {/* 年度收支柱狀圖 */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={monthlyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip
                                        formatter={(value: number) => `NT$${value.toLocaleString()}`}
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2937' }}
                                        labelStyle={{ color: '#1f2937' }}
                                    />
                                    <Legend wrapperStyle={{ color: '#1f2937' }} />
                                    <Bar dataKey="income" fill="#22c55e" name="收入" />
                                    <Bar dataKey="expense" fill="#ef4444" name="支出" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
