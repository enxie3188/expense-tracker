'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
}

export function MonthPicker({ selectedDate, onChange }: MonthPickerProps) {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const goToPreviousMonth = () => {
        const newDate = new Date(year, month - 1, 1);
        onChange(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(year, month + 1, 1);
        onChange(newDate);
    };

    const goToCurrentMonth = () => {
        onChange(new Date());
    };

    const monthText = `${year}年 ${month + 1}月`;

    return (
        <div className="flex items-center justify-between mb-6">
            <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900">{monthText}</span>
                <button
                    onClick={goToCurrentMonth}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    本月
                </button>
            </div>

            <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
