// English translations
import { Translations } from './zh-TW';

export const en: Translations = {
    // Common
    common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        confirm: 'Confirm',
        reset: 'Reset',
        update: 'Update',
        loading: 'Loading...',
        noData: 'No data',
        all: 'All',
        or: 'or',
        details: 'Details',
        images: 'Attachments',
    },

    // Navigation
    nav: {
        transactions: 'Transactions',
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        settings: 'Settings',
    },

    // Dashboard
    dashboard: {
        title: 'Dashboard',
        totalEquity: 'Total Equity',
        dayChange: 'Daily P&L',
        weekChange: 'Weekly P&L',
        monthChange: 'Monthly P&L',
        yearChange: 'Yearly P&L',
        totalChange: 'Total P&L',
        tradeCount: 'Trades',
        addTransaction: 'Add Trade',
    },

    // Transactions
    transactions: {
        title: 'Transactions',
        viewHistory: 'View all transaction history',
        countSuffix: 'transactions',
        clickAdd: 'Click the + button below to add a transaction',
        clickAddDesktop: 'Click the + button at top right to add a transaction',
        noTransactions: 'No transactions yet',
        deleteConfirmTitle: 'Delete Transaction',
        deleteConfirmMessage: 'Are you sure you want to delete the "{symbol}" transaction? This action cannot be undone.',
        deleteLedgerTitle: 'Delete Ledger',
        deleteLedgerMessage: 'Are you sure you want to delete ledger "{name}"? All related transactions will also be deleted.',
        selectLedger: 'Select Ledger',
        allLedgers: 'All Ledgers',
        note: 'Note',
        commission: 'Commission',
    },

    // Trading Form
    tradingForm: {
        addTitle: 'Add Trade',
        editTitle: 'Edit Trade',
        symbol: 'Symbol',
        symbolPlaceholder: 'AAPL, TSLA',
        quantity: 'Quantity',
        contracts: 'Contracts',
        totalValue: 'Total Value',
        quantityPlaceholder: '100 shares',
        entryPrice: 'Entry Price',
        exitPrice: 'Exit Price',
        pointValue: 'Point Value',
        date: 'Date',
        entryDate: 'Entry Date',
        exitDate: 'Exit Date',
        strategy: 'Strategy',
        selectStrategy: 'Select Strategy',
        noStrategy: 'No Strategy',
        direction: 'Direction',
        long: 'Long',
        short: 'Short',
        commission: 'Commission',
        note: 'Trade Notes',
        notePlaceholder: 'Record your trade ideas, market observations...',
        pnlPreview: 'Estimated P&L',
        submit: 'Add Trade',
        submitEdit: 'Save Changes',
        validation: {
            symbolRequired: 'Please enter a symbol',
            quantityRequired: 'Please enter a valid quantity',
            priceRequired: 'Please enter a valid price',
        },
    },

    // Analytics
    analytics: {
        title: 'Trading Analytics',
        selectStrategy: 'Select Strategy',
        allStrategies: 'All Strategies',
        selectLedger: 'Select Ledger',
        allLedgers: 'All Ledgers',
        metrics: {
            coreMetrics: 'Core Metrics',
            profitAnalysis: 'Profit Analysis',
            riskMetrics: 'Risk Metrics',
            maxConsecutiveLosses: 'Max Loss Streak',
            totalPnL: 'Total P&L',
            winRate: 'Win Rate',
            profitFactor: 'Profit Factor',
            avgWin: 'Avg Win',
            avgLoss: 'Avg Loss',
            maxDrawdown: 'Max Drawdown',
            sharpeRatio: 'Sharpe Ratio',
            totalTrades: 'Total Trades',
            winTrades: 'Winning Trades',
            lossTrades: 'Losing Trades',
            avgHoldingDays: 'Avg Holding Days',
            expectancy: 'Expectancy',
            maxSingleWin: 'Largest Win',
            maxConsecutiveWins: 'Max Win Streak',
        },
        calendar: {
            title: 'Profit Calendar',
            weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            weeklyTotal: 'Weekly',
            tradeCountSuffix: 'tx',
            profit: 'Profit',
            loss: 'Loss',
            noTrade: 'No Trade',
        },
    },

    // Settings
    settings: {
        title: 'Settings',
        subtitle: 'Customize your trading journal experience',

        // Appearance
        appearance: {
            title: 'Appearance',
            description: 'Customize theme, language and interface preferences',
            theme: 'Theme',
            themeDark: '🌙 Dark',
            themeLight: '☀️ Light',
            themeAuto: '🔄 Auto',
            language: 'Language',
            fontSize: 'Font Size',
            fontSmall: 'Small',
            fontMedium: 'Medium',
            fontLarge: 'Large',
        },

        // Ledger & Strategy
        ledgerStrategy: {
            title: 'Ledgers & Strategies',
            description: 'Manage your ledgers and trading strategies',
            ledgers: 'Ledgers',
            addLedger: 'Add Ledger',
            noLedgers: 'No ledgers yet. Click the button above to add one.',
            strategies: 'Strategies',
            addStrategy: 'Add Strategy',
            noStrategies: 'No strategies yet. Click the button above to add one.',
            deleteLedgerTitle: 'Delete Ledger',
            deleteLedgerMessage: 'Are you sure you want to delete ledger "{name}"? This will also delete all transactions in this ledger.',
            deleteStrategyTitle: 'Delete Strategy',
            deleteStrategyMessage: 'Are you sure you want to delete strategy "{name}"?',
        },

        // Notifications
        notification: {
            title: 'Notifications',
            description: 'Manage reminders and notification preferences',
            dailyReminder: 'Daily Trading Reminder',
            soundEffects: 'Sound Effects',
        },

        // Transaction Settings
        transaction: {
            title: 'Transaction Settings',
            description: 'Customize transaction display and sorting',
            defaultSort: 'Default Sort',
            sortDateDesc: 'Date (Newest First)',
            sortDateAsc: 'Date (Oldest First)',
            sortAmountDesc: 'Amount (High to Low)',
            sortAmountAsc: 'Amount (Low to High)',
            itemsPerPage: 'Items Per Page',
            showFilters: 'Show Filters by Default',
        },

        // Data Management
        data: {
            title: 'Data Management',
            description: 'Backup, restore and reset your data',
            export: 'Export All Data',
            import: 'Import Data',
            clearTransactions: 'Clear All Transactions',
            clearTransactionsConfirm: 'Are you sure you want to clear all transactions?\n\nYou currently have {count} transactions.\nLedgers and strategies will be preserved.\n\nThis action cannot be undone!',
            clearTransactionsSuccess: 'All transactions have been cleared',
            reset: 'Reset to Defaults',
            resetTitle: 'Reset All Settings',
            resetMessage: 'Are you sure you want to reset all settings? This will restore default values and all custom settings and data will be lost.',
            resetSuccess: 'System has been reset to default state',
            importConfirm: 'Are you sure you want to import this data?\n\nThis will import:\n• {transactions} transactions\n• {ledgers} ledgers\n• {strategies} strategies\n\n✅ New data will be merged with existing data\n(Duplicate items will be skipped)',
            importSuccess: 'Data imported successfully!',
            importError: 'Import failed: Invalid file format',
            importInvalid: 'Import failed: Invalid backup file format',
        },
    },

    // Ledger Modal
    ledgerModal: {
        addTitle: 'Add Ledger',
        editTitle: 'Edit Ledger',
        name: 'Ledger Name',
        namePlaceholder: 'e.g., Crypto Portfolio',
        assetType: 'Asset Type',
        initialBalance: 'Initial Balance',
        color: 'Color Label',
        assetTypes: {
            crypto: 'Crypto',
            'stock-tw': 'TW Stocks',
            'stock-us': 'US Stocks',
            futures: 'Futures',
            forex: 'Forex',
            other: 'Other',
        },
        validation: {
            nameRequired: 'Please enter a ledger name',
            balanceInvalid: 'Please enter a valid initial balance',
        },
    },

    // Strategy Modal
    strategyModal: {
        addTitle: 'Add Strategy',
        editTitle: 'Edit Strategy',
        name: 'Strategy Name',
        namePlaceholder: 'e.g., Moving Average Breakout',
        description: 'Description (Optional)',
        descriptionPlaceholder: 'Describe entry/exit rules, risk management, etc...',
        color: 'Color Label',
        validation: {
            nameRequired: 'Please enter a strategy name',
        },
    },

    // Colors
    colors: {
        blue: 'Blue',
        green: 'Green',
        pink: 'Pink',
        orange: 'Orange',
        purple: 'Purple',
        red: 'Red',
    },

    // Time Range
    timeRange: {
        '1D': '1D',
        '1W': '1W',
        '1M': '1M',
        '3M': '3M',
        '1Y': '1Y',
        'ALL': 'ALL',
    },

    // Empty State
    emptyState: {
        noLedger: {
            title: 'Welcome to AlphaLog!',
            description: 'Ready to start your trading journey? Create your first ledger to track all your trades and performance.',
            action: '✨ Create First Ledger',
        },
        noTransaction: {
            title: 'No Transactions Yet',
            description: 'Start recording your first trade to see your equity curve and performance analytics.',
            action: '+ Add Trade',
        },
    },

    // Onboarding Tour
    onboarding: {
        skip: 'Skip Tour',
        prev: 'Previous',
        next: 'Next',
        start: 'Get Started',
        steps: {
            welcome: {
                title: 'Welcome to AlphaLog!',
                description: 'This is your personal trading journal. Let\'s quickly learn how to use the features to help you track and analyze your trading performance.',
            },
            ledger: {
                title: 'Create a Ledger',
                description: 'First, you need to create a ledger. A ledger can represent different trading accounts, such as "US Stocks Account" or "Futures Account". Go to Settings to create your first ledger.',
            },
            transaction: {
                title: 'Record Trades',
                description: 'On desktop, click the "+ Add Trade" button in the top right corner. On mobile, tap the "+" button at the bottom. Enter entry/exit prices and quantity, and the system will calculate your P&L automatically.',
            },
            dashboard: {
                title: 'Dashboard Overview',
                description: 'The Dashboard shows your equity curve, total P&L, win rate, and other key metrics. Get a clear view of your trading performance at a glance.',
            },
            analytics: {
                title: 'Performance Analytics',
                description: 'In the "Analytics" page, you can see detailed statistics including calendar heatmaps, strategy performance comparisons, and more.',
            },
            settings: {
                title: 'Ledger & Strategy Management',
                description: 'Manage your ledgers and trading strategies in "Settings". You can create multiple ledgers to separate different trading accounts.',
            },
        },
    },
};

