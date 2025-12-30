// 繁體中文翻譯
export const zhTW = {
    // 通用
    common: {
        save: '儲存',
        cancel: '取消',
        delete: '刪除',
        edit: '編輯',
        add: '新增',
        confirm: '確認',
        reset: '重置',
        update: '更新',
        loading: '載入中...',
        noData: '暫無資料',
        all: '全部',
        or: '或',
        details: '記錄明細',
        images: '附件',
    },

    // 導航
    nav: {
        transactions: '交易記錄',
        dashboard: 'Dashboard',
        analytics: '績效分析',
        settings: '設定',
    },

    // Dashboard
    dashboard: {
        title: 'Dashboard',
        totalEquity: '總資產估值',
        dayChange: '日變動',
        weekChange: '週變動',
        monthChange: '月變動',
        yearChange: '年變動',
        totalChange: '總變動',
        tradeCount: '交易次數',
        addTransaction: '新增交易',
    },

    // 交易記錄
    transactions: {
        title: '交易記錄',
        viewHistory: '查看所有交易歷史',
        countSuffix: '筆交易',
        clickAdd: '點擊底部的 + 按鈕新增交易',
        clickAddDesktop: '點擊右上角的 + 號新增交易',
        noTransactions: '尚無交易記錄',
        deleteConfirmTitle: '刪除交易記錄',
        deleteConfirmMessage: '確定要刪除「{symbol}」的交易記錄嗎？此操作無法復原。',
        deleteLedgerTitle: '刪除帳本',
        deleteLedgerMessage: '確定要刪除帳本「{name}」嗎？刪除後該帳本的所有交易記錄也會被刪除。',
        selectLedger: '選擇帳本',
        allLedgers: '全部帳本',
        note: '備註',
        commission: '手續費',
    },

    // 交易表單
    tradingForm: {
        addTitle: '新增交易',
        editTitle: '編輯交易',
        symbol: '交易標的',
        symbolPlaceholder: 'AAPL, 2330.TW',
        quantity: '數量',
        contracts: '口數',
        totalValue: '總倉位價值',
        quantityPlaceholder: '100 股',
        entryPrice: '進場價格',
        exitPrice: '出場價格',
        pointValue: '點值',
        date: '交易日期',
        entryDate: '進場時間',
        exitDate: '出場時間',
        strategy: '交易策略',
        selectStrategy: '選擇策略',
        noStrategy: '不選擇策略',
        direction: '方向',
        long: '做多',
        short: '做空',
        commission: '手續費',
        note: '交易備註',
        notePlaceholder: '記錄交易想法、市場觀察...',
        pnlPreview: '預估損益',
        submit: '新增交易',
        submitEdit: '儲存變更',
        validation: {
            symbolRequired: '請輸入交易標的',
            quantityRequired: '請輸入有效數量',
            priceRequired: '請輸入有效價格',
        },
    },

    // 績效分析
    analytics: {
        title: '交易績效分析',
        selectStrategy: '選擇策略',
        allStrategies: '全部策略',
        selectLedger: '選擇帳本',
        allLedgers: '全部帳本',
        metrics: {
            coreMetrics: '核心指標',
            profitAnalysis: '獲利分析',
            riskMetrics: '風險指標',
            maxConsecutiveLosses: '最大連虧',
            totalPnL: '總損益',
            winRate: '勝率',
            profitFactor: '獲利因子',
            avgWin: '平均獲利',
            avgLoss: '平均虧損',
            maxDrawdown: '最大回撤',
            sharpeRatio: 'Sharpe Ratio',
            totalTrades: '總交易次數',
            winTrades: '獲利筆數',
            lossTrades: '虧損筆數',
            avgHoldingDays: '平均持有天數',
            expectancy: '期望值',
            maxSingleWin: '最大單筆獲利',
            maxConsecutiveWins: '最大連勝',
        },
        calendar: {
            title: '盈利日曆',
            weekDays: ['日', '一', '二', '三', '四', '五', '六'],
            months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            weeklyTotal: '週計',
            tradeCountSuffix: '筆',
            profit: '獲利',
            loss: '虧損',
            noTrade: '無交易',
        },
    },

    // 設定
    settings: {
        title: '系統設定',
        subtitle: '自訂您的交易日誌體驗',

        // 外觀
        appearance: {
            title: '外觀與顯示',
            description: '自訂主題、語言和介面偏好',
            theme: '主題模式',
            themeDark: '🌙 深色',
            themeLight: '☀️ 淺色',
            themeAuto: '🔄 自動',
            language: '語言',
            fontSize: '字體大小',
            fontSmall: '小',
            fontMedium: '中',
            fontLarge: '大',
        },

        // 帳本與策略
        ledgerStrategy: {
            title: '帳本與策略管理',
            description: '管理您的帳本和交易策略',
            ledgers: '帳本',
            addLedger: '新增帳本',
            noLedgers: '尚無帳本，點擊上方按鈕新增',
            strategies: '策略',
            addStrategy: '新增策略',
            noStrategies: '尚無策略，點擊上方按鈕新增',
            deleteLedgerTitle: '刪除帳本',
            deleteLedgerMessage: '確定要刪除帳本「{name}」嗎？此操作將同時刪除該帳本的所有交易記錄。',
            deleteStrategyTitle: '刪除策略',
            deleteStrategyMessage: '確定要刪除策略「{name}」嗎？',
        },

        // 通知
        notification: {
            title: '通知與提醒',
            description: '管理提醒和通知偏好',
            dailyReminder: '每日交易提醒',
            soundEffects: '音效',
        },

        // 交易記錄
        transaction: {
            title: '交易記錄設定',
            description: '自訂交易記錄的顯示和排序',
            defaultSort: '預設排序方式',
            sortDateDesc: '日期 (新到舊)',
            sortDateAsc: '日期 (舊到新)',
            sortAmountDesc: '金額 (大到小)',
            sortAmountAsc: '金額 (小到大)',
            itemsPerPage: '每頁顯示數量',
            showFilters: '預設顯示篩選器',
        },

        // 資料管理
        data: {
            title: '資料管理',
            description: '備份、還原和重置您的資料',
            export: '導出所有資料',
            import: '導入資料',
            clearTransactions: '清除所有交易',
            clearTransactionsConfirm: '確定要清除所有交易記錄嗎？\n\n目前共有 {count} 筆交易記錄。\n帳本和策略設定將會保留。\n\n此操作無法復原！',
            clearTransactionsSuccess: '已清除所有交易記錄',
            reset: '恢復預設設定',
            resetTitle: '重置所有設定',
            resetMessage: '確定要重置所有設定嗎？這將恢復到系統預設值，所有自訂設定和資料都將遺失。',
            resetSuccess: '系統已重置到預設狀態',
            importConfirm: '確定要導入資料嗎？\n\n將導入：\n• {transactions} 筆交易\n• {ledgers} 個帳本\n• {strategies} 個策略\n\n✅ 新資料將與現有資料合併\n（重複的項目會被跳過）',
            importSuccess: '資料導入成功！',
            importError: '導入失敗：文件格式錯誤',
            importInvalid: '導入失敗：無效的備份文件格式',
        },
    },

    // 帳本 Modal
    ledgerModal: {
        addTitle: '新增帳本',
        editTitle: '編輯帳本',
        name: '帳本名稱',
        namePlaceholder: '例如：加密貨幣投資組合',
        assetType: '資產類型',
        initialBalance: '初始金額',
        color: '顏色標籤',
        assetTypes: {
            crypto: '加密貨幣',
            'stock-tw': '台股',
            'stock-us': '美股',
            futures: '期貨',
            forex: '外匯',
            other: '其他',
        },
        validation: {
            nameRequired: '請輸入帳本名稱',
            balanceInvalid: '請輸入有效的初始金額',
        },
    },

    // 策略 Modal
    strategyModal: {
        addTitle: '新增策略',
        editTitle: '編輯策略',
        name: '策略名稱',
        namePlaceholder: '例如：均線突破、網格交易',
        description: '策略說明（選填）',
        descriptionPlaceholder: '描述策略的進出場規則、風險管理等...',
        color: '顏色標籤',
        validation: {
            nameRequired: '請輸入策略名稱',
        },
    },

    // 顏色
    colors: {
        blue: '藍色',
        green: '綠色',
        pink: '粉紅',
        orange: '橘色',
        purple: '紫色',
        red: '紅色',
    },

    // 時間範圍
    timeRange: {
        '1D': '1D',
        '1W': '1W',
        '1M': '1M',
        '3M': '3M',
        '1Y': '1Y',
        'ALL': 'ALL',
    },

    // 空狀態
    emptyState: {
        noLedger: {
            title: '歡迎來到 AlphaLog！',
            description: '準備開始記錄您的交易旅程嗎？創建第一個帳本，開始追蹤您的每一筆交易和績效。',
            action: '✨ 創建第一個帳本',
        },
        noTransaction: {
            title: '尚無交易資料',
            description: '開始記錄您的第一筆交易，查看您的權益曲線和績效分析。',
            action: '+ 新增交易',
        },
    },

    // 新手導覽
    onboarding: {
        skip: '跳過導覽',
        prev: '上一步',
        next: '下一步',
        start: '開始使用',
        steps: {
            welcome: {
                title: '歡迎使用 AlphaLog！',
                description: '這是您的專屬交易日誌系統。讓我們快速了解如何使用各項功能，幫助您追蹤和分析交易績效。',
            },
            ledger: {
                title: '創建帳本',
                description: '首先，您需要創建一個帳本。帳本可以是不同的交易帳戶，例如「美股帳戶」、「期貨帳戶」等。前往設定頁面創建您的第一個帳本。',
            },
            transaction: {
                title: '記錄交易',
                description: '在電腦版點擊右上角的「+新增交易」按鈕，或在手機版點擊底部的「+」按鈕來記錄新的交易。包含買入價、賣出價、數量等資訊，系統會自動計算盈虧。',
            },
            dashboard: {
                title: 'Dashboard 總覽',
                description: 'Dashboard 顯示您的權益曲線、總盈虧、勝率等關鍵指標。一目瞭然掌握交易表現。',
            },
            analytics: {
                title: '績效分析',
                description: '在「績效分析」頁面，您可以看到更詳細的統計數據，包括月曆熱力圖、策略績效比較等。',
            },
            settings: {
                title: '帳本與策略管理',
                description: '在「設定」中管理您的帳本和交易策略。您可以創建多個帳本來區分不同的交易帳戶。',
            },
        },
    },
};

export type Translations = typeof zhTW;

