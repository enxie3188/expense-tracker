/**
 * 測試數據腳本 - 添加多筆不同日期的交易
 * 
 * 使用方法：
 * 1. 打開瀏覽器控制台（F12）
 * 2. 複製並貼上此腳本
 * 3. 按 Enter 執行
 * 4. 刷新頁面查看結果
 */

// 獲取當前數據
const currentData = JSON.parse(localStorage.getItem('finance-data') || '{"transactions":[],"categories":[],"ledgers":[],"strategies":[]}');

// 確保有至少一個帳本
if (currentData.ledgers.length === 0) {
    console.error('❌ 沒有找到帳本！請先創建一個帳本。');
} else {
    const ledgerId = currentData.ledgers[0].id;
    const ledgerName = currentData.ledgers[0].name;

    console.log(`✅ 使用帳本: ${ledgerName} (${ledgerId})`);

    // 測試交易數據
    const testTransactions = [
        {
            id: crypto.randomUUID(),
            type: 'trading' as const,
            symbol: 'TSLA',
            direction: 'long' as const,
            entryPrice: 380,
            exitPrice: 395,
            quantity: 50,
            commission: 10,
            date: '2025-12-25T09:30:00',
            pnl: (395 - 380) * 50 - 10,
            ledgerId: ledgerId,
            createdAt: new Date().toISOString()
        },
        {
            id: crypto.randomUUID(),
            type: 'trading' as const,
            symbol: 'NVDA',
            direction: 'long' as const,
            entryPrice: 520,
            exitPrice: 510,
            quantity: 30,
            commission: 8,
            date: '2025-12-26T14:20:00',
            pnl: (510 - 520) * 30 - 8,
            ledgerId: ledgerId,
            createdAt: new Date().toISOString()
        },
        {
            id: crypto.randomUUID(),
            type: 'trading' as const,
            symbol: 'GOOGL',
            direction: 'short' as const,
            entryPrice: 140,
            exitPrice: 135,
            quantity: 40,
            commission: 6,
            date: '2025-12-27T10:15:00',
            pnl: (140 - 135) * 40 - 6,
            ledgerId: ledgerId,
            createdAt: new Date().toISOString()
        },
        {
            id: crypto.randomUUID(),
            type: 'trading' as const,
            symbol: 'AAPL',
            direction: 'long' as const,
            entryPrice: 195,
            exitPrice: 198,
            quantity: 100,
            commission: 12,
            date: '2025-12-28T00:45:00',
            pnl: (198 - 195) * 100 - 12,
            ledgerId: ledgerId,
            createdAt: new Date().toISOString()
        },
        {
            id: crypto.randomUUID(),
            type: 'trading' as const,
            symbol: 'MSFT',
            direction: 'long' as const,
            entryPrice: 425,
            exitPrice: 430,
            quantity: 25,
            commission: 5,
            date: '2025-12-24T11:00:00',
            pnl: (430 - 425) * 25 - 5,
            ledgerId: ledgerId,
            createdAt: new Date().toISOString()
        }
    ];

    // 添加交易到現有數據
    currentData.transactions = [
        ...currentData.transactions,
        ...testTransactions
    ];

    // 保存回 localStorage
    localStorage.setItem('finance-data', JSON.stringify(currentData));

    console.log('✅ 成功添加 5 筆測試交易:');
    console.table(testTransactions.map(t => ({
        日期: new Date(t.date).toLocaleString('zh-TW'),
        標的: t.symbol,
        方向: t.direction === 'long' ? '做多' : '做空',
        數量: t.quantity,
        盈虧: `$${t.pnl.toFixed(2)}`
    })));

    console.log('\n🔄 請刷新頁面查看權益曲線！');
    console.log('📊 前往 Dashboard 查看完整曲線圖表');
    console.log('🕐 檢查 tooltip 時間是否正確顯示（應為本地時間）');
}
