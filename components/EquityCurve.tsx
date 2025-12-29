'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
import { EquityPoint } from '@/types/ledger';

interface EquityCurveProps {
    data: EquityPoint[];
    isProfit: boolean;
    startBalance?: number;
    timeRange?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
}

export function EquityCurve({ data, isProfit, startBalance = 10000, timeRange = 'ALL' }: EquityCurveProps) {
    console.log('EquityCurve received data:', data);
    console.log('Data length:', data.length);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[280px] md:h-[400px] text-[var(--text-muted)] p-4 lg:p-6">
                <div className="text-center">
                    <p className="text-lg mb-2">尚無交易資料</p>
                    <p className="text-sm">請新增交易以查看權益曲線</p>
                </div>
            </div>
        );
    }

    // Detect theme for grid colors and mobile for responsive sizing
    const [isDark, setIsDark] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(() => {
        // 初始化時嘗試偵測（用於 hydration 後的正確顯示）
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768;
        }
        return false; // SSR fallback
    });

    useEffect(() => {
        setMounted(true); // Set mounted to true after client-side hydration
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark-mode') ||
                !document.documentElement.classList.contains('light-mode'));
        };

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkTheme();
        checkMobile(); // 立即再次檢查確保正確

        // Watch for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Watch for resize
        window.addEventListener('resize', checkMobile);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    if (!mounted) return null; // Valid fix for SSR/Hydration issues with Plotly

    // 準備 Plotly 資料
    // 將 ISO 日期轉換為本地時間格式，確保與 x 軸範圍一致
    const formatToLocalTime = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    };

    // 計算最小間距（根據時間範圍調整）
    const getMinSpacing = () => {
        switch (timeRange) {
            case '1D': return 20 * 60 * 1000; // 20 分鐘
            case '1W': return 1 * 60 * 60 * 1000; // 1 小時
            case '1M': return 8 * 60 * 60 * 1000; // 8 小時
            case '1Y': return 2 * 24 * 60 * 60 * 1000; // 2 天
            case 'ALL': return 2 * 24 * 60 * 60 * 1000; // 2 天（與 1Y 相同）
            default: return 0;
        }
    };

    // 分散相近的數據點，確保有最小間距
    const spreadDates = () => {
        const minSpacing = getMinSpacing();
        if (minSpacing === 0 || data.length === 0) {
            return data.map(d => formatToLocalTime(new Date(d.date)));
        }

        const spreadDatesArr: string[] = [];
        let lastTime = new Date(data[0].date).getTime();
        spreadDatesArr.push(formatToLocalTime(new Date(data[0].date)));

        for (let i = 1; i < data.length; i++) {
            const currentTime = new Date(data[i].date).getTime();
            const timeDiff = currentTime - lastTime;

            if (timeDiff < minSpacing) {
                // 如果間距太小，將這個點往後推
                lastTime = lastTime + minSpacing;
            } else {
                lastTime = currentTime;
            }
            spreadDatesArr.push(formatToLocalTime(new Date(lastTime)));
        }

        return spreadDatesArr;
    };

    const dates = spreadDates();

    // 計算 X 軸的結束時間（包含 rightPadding），用於延伸填充區域
    const getEndDateForFill = () => {
        const now = new Date();
        let rightPadding: number;
        switch (timeRange) {
            case '1D': rightPadding = 1 * 60 * 60 * 1000; break;
            case '1W': rightPadding = 1 * 60 * 60 * 1000; break;
            case '1M': rightPadding = 1 * 60 * 60 * 1000; break;
            case '1Y': rightPadding = 14 * 24 * 60 * 60 * 1000; break;
            case 'ALL': rightPadding = 14 * 24 * 60 * 60 * 1000; break; // 與 1Y 相同
            default: return null;
        }
        return new Date(now.getTime() + rightPadding);
    };

    // 添加結束點以延伸綠色填充
    const extendedDates = [...dates];
    const extendedEquities = [...data.map((d) => d.equity)];
    const endDateForFill = getEndDateForFill();
    if (endDateForFill && data.length > 0) {
        extendedDates.push(formatToLocalTime(endDateForFill));
        extendedEquities.push(data[data.length - 1].equity); // 使用最後一個點的權益值
    }

    const equities = data.map((d) => d.equity);

    // 使用時間範圍的起點金額作為百分比計算的基準
    const periodStartEquity = data.length > 0 ? data[0].equity : startBalance;
    const percentages = equities.map(e => ((e - periodStartEquity) / periodStartEquity) * 100);

    // 保留原始日期用於 hover 顯示
    const originalDates = data.map((d) => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    });

    // 準備 hover 文本（包含交易詳情和原始日期）
    const hoverTexts = data.map((d, i) => {
        const dateStr = originalDates[i];
        if (d.symbol) {
            const directionText = d.direction === 'long' ? 'Long' : 'Short';
            const pnlSign = d.pnl >= 0 ? '+' : '';
            return `<b>日期</b>: ${dateStr}<br>` +
                `<b>${d.symbol}</b> ${directionText}<br>` +
                `盈虧: ${pnlSign}$${d.pnl.toFixed(2)}`;
        }
        return `<b>日期</b>: ${dateStr}<br>起始點`;
    });

    // Marker sizes: 只對真正的交易顯示標記，合成起始點不顯示
    const markerSizes = data.map((d) => d.symbol ? (isMobile ? 3 : 4) : 0);

    console.log('Plotly dates:', dates);
    console.log('Plotly equities:', equities);
    console.log('Plotly percentages:', percentages);

    // 計算實際權益的最小值和最大值
    const minEquity = Math.min(...equities);
    const maxEquity = Math.max(...equities);

    // 計算範圍和 padding
    const range = maxEquity - minEquity;
    const padding = Math.max(range * 0.2, 100); // 至少 20% padding 或 $100

    // 設置 Y 軸範圍
    const yMin = minEquity - padding;
    const yMax = maxEquity + padding;

    // 計算右側 Y 軸的百分比範圍（基於時間範圍起點）
    const yMinPercent = ((yMin - periodStartEquity) / periodStartEquity) * 100;
    const yMaxPercent = ((yMax - periodStartEquity) / periodStartEquity) * 100;

    console.log('Y-axis range:', { yMin, yMax, minEquity, maxEquity });
    console.log('Percent range:', { yMinPercent, yMaxPercent });

    // 選擇顏色（獲利=綠色，虧損=粉紅色）
    const lineColor = isProfit ? 'rgb(34, 197, 94)' : 'rgb(236, 72, 153)';
    const fillColor = isProfit
        ? 'rgba(34, 197, 94, 0.15)'
        : 'rgba(236, 72, 153, 0.15)';

    return (
        <Plot
            data={[
                // 主要 trace - 權益曲線（綁定到左側 Y 軸）
                {
                    x: extendedDates,
                    y: extendedEquities,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: '權益',
                    yaxis: 'y',
                    line: {
                        color: lineColor,
                        width: 2,
                        shape: 'hv', // 階梯線：水平後垂直，更容易看清交易變化
                    },
                    marker: {
                        size: [...markerSizes, 0], // 延伸點不顯示 marker
                        color: lineColor,
                        line: {
                            color: '#000000',
                            width: isMobile ? 0 : 1,
                        },
                    },
                    fill: 'tozeroy',
                    fillcolor: fillColor,
                    customdata: [...hoverTexts, ''], // 延伸點不顯示 hover 文本
                    hovertemplate:
                        '%{customdata}<br>' +
                        '<b>權益</b>: $%{y:,.2f}' +
                        '<extra></extra>', // 隱藏 trace 名稱和 X 軸值
                },
                // 隱藏的 trace - 用於顯示右側百分比軸
                {
                    x: dates,
                    y: percentages,
                    type: 'scatter',
                    mode: 'none',
                    yaxis: 'y2',
                    showlegend: false,
                    hoverinfo: 'skip',
                },
            ]}
            layout={{
                autosize: true,
                height: isMobile ? 280 : 400,
                margin: isMobile
                    ? { l: 40, r: 45, t: 15, b: 35 }
                    : { l: 50, r: 60, t: 20, b: 40 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { color: '#a0a0a0', size: isMobile ? 10 : 12 },
                hovermode: 'closest', // 使用 closest 模式避免顯示 X 軸標題欄
                xaxis: {
                    gridcolor: isDark ? '#1a1a1a' : '#e5e7eb',
                    showgrid: true,
                    zeroline: false,
                    showline: false, // 隱藏軸線避免太粗
                    color: isDark ? '#a0a0a0' : '#6b7280',
                    tickformat: timeRange === '1D' ? '%H:%M' : '%b %d', // 1D shows time, others show date
                    nticks: timeRange === 'ALL' ? 0 : (isMobile ? 3 : (timeRange === '1Y' ? 12 : 6)), // ALL 不顯示刻度
                    showticklabels: timeRange !== 'ALL', // ALL 隱藏所有刻度標籤
                    dtick: timeRange === '1Y' ? (isMobile ? 'M3' : 'M1') : undefined, // 1Y 手機版每季一刻度，桌面版每月一刻度
                    tick0: timeRange === '1Y' ? new Date(new Date().getFullYear(), 0, 1).toISOString() : undefined, // 從 1 月 1 日開始
                    fixedrange: true, // Disable zoom
                    range: (() => {
                        const now = new Date();
                        const formatLocal = (d: Date) =>
                            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

                        // 計算右邊 padding（讓最新的點有空間顯示）
                        let rightPadding: number;
                        switch (timeRange) {
                            case '1D':
                                rightPadding = 1 * 60 * 60 * 1000; // 1 小時
                                break;
                            case '1W':
                                rightPadding = 1 * 60 * 60 * 1000; // 1 小時（像 1D 一樣）
                                break;
                            case '1M':
                                rightPadding = 1 * 60 * 60 * 1000; // 1 小時（像 1D 一樣）
                                break;
                            case '1Y':
                                rightPadding = 14 * 24 * 60 * 60 * 1000; // 14 天
                                break;
                            default:
                                rightPadding = 0;
                        }

                        // 結束時間 = 現在 + rightPadding
                        const endDate = new Date(now.getTime() + rightPadding);

                        // 起始時間也要加上 rightPadding，維持固定的時間跨度
                        let startDate: Date;
                        switch (timeRange) {
                            case '1D':
                                // 1D 特殊處理：從今天 00:00 開始，但往後推 rightPadding
                                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                                startDate = new Date(todayStart.getTime() + rightPadding);
                                break;
                            case '1W':
                                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + rightPadding);
                                break;
                            case '1M':
                                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 + rightPadding);
                                break;
                            case '1Y':
                                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000 + rightPadding);
                                break;
                            default: // ALL - no fixed range
                                return undefined;
                        }

                        return [formatLocal(startDate), formatLocal(endDate)];
                    })(),
                },
                yaxis: {
                    title: '',
                    gridcolor: isDark ? '#1a1a1a' : '#e5e7eb',
                    showgrid: true,
                    showline: false, // 隱藏軸線
                    zeroline: true,
                    zerolinecolor: isDark ? '#404040' : '#d1d5db',
                    zerolinewidth: 1,
                    color: isDark ? '#a0a0a0' : '#6b7280',
                    tickprefix: isMobile ? '' : '$',
                    nticks: isMobile ? 5 : 8, // 減少 Y 軸刻度
                    range: [yMin, yMax],
                    side: 'left',
                    fixedrange: true, // Disable zoom
                },
                yaxis2: {
                    title: '',
                    overlaying: 'y',
                    side: 'right',
                    showgrid: false,
                    zeroline: false,
                    color: isProfit ? 'rgb(34, 197, 94)' : 'rgb(236, 72, 153)',
                    ticksuffix: '%',
                    range: [yMinPercent, yMaxPercent],
                    tickmode: 'auto',
                    nticks: isMobile ? 5 : 8,
                    fixedrange: true, // Disable zoom
                },
                hoverlabel: {
                    bgcolor: isDark ? '#1a1a1a' : '#ffffff',
                    bordercolor: isDark ? '#404040' : '#d1d5db',
                    font: { color: isDark ? '#ffffff' : '#111827', size: 13 },
                    align: 'left', // 文字靠左對齊
                },
                showlegend: false,
                dragmode: false,
            }}
            config={{
                displayModeBar: false,
                responsive: true,
            }}
            style={{ width: '100%', height: '100%' }}
        />
    );
}
