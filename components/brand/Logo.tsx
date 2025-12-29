import React from 'react';

export const AlphaLogLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* 裝飾性背景線條 */}
            <path d="M20 70H80M20 50H60M20 30H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-10" />

            {/* Alpha 核心與上升箭頭 */}
            <path
                d="M30 65C30 55 45 45 55 45C65 45 70 52 70 60C70 75 45 75 30 65C15 55 25 35 45 25L85 5"
                stroke="#06B6D4"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* 箭頭尖端 */}
            <path d="M65 5H85V25" stroke="#06B6D4" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
