import React from 'react';

export const CyberBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* 基礎底色 - Ensuring brand-dark background if CSS vars fail */}
        <div className="absolute inset-0 bg-[#0B1120]" />
        {/* 點狀網格 */}
        <div className="absolute inset-0 bg-cyber-pattern bg-[size:40px_40px]" />
        {/* 裝飾線條 */}
        <svg className="absolute w-full h-full opacity-[0.03]">
            <pattern id="lines" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M0 100 L200 100 M100 0 L100 200" stroke="#06B6D4" strokeWidth="1" />
                <circle cx="100" cy="100" r="3" fill="#06B6D4" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#lines)" />
        </svg>
        {/* 漸層光暈 */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
    </div>
);
