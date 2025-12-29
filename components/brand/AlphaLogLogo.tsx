'use client';

import React, { useEffect, useState } from 'react';

export const AlphaLogLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // 初始檢查
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark') ||
                !document.documentElement.classList.contains('light-mode'));
        };

        checkDarkMode();

        // 監聽 class 變化
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    return (
        <img
            src="/alphalog-logo.png"
            alt="AlphaLog"
            className={className}
            style={{
                objectFit: 'contain',
                mixBlendMode: isDarkMode ? 'screen' : 'normal',
                filter: isDarkMode ? 'brightness(1.1)' : 'none'
            }}
        />
    );
};
