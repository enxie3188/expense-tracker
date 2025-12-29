/**
 * 帳本（Ledger）型別定義
 */
export interface Ledger {
  id: string;
  name: string;
  assetType: 'crypto' | 'stock-tw' | 'stock-us' | 'futures' | 'forex' | 'other';
  initialBalance: number;  // 初始資金
  icon: string;
  color: string;
  createdAt: string;
}

/**
 * 交易策略型別定義
 */
export interface Strategy {
  id: string;
  name: string;             // 策略名稱，例如："均線突破"、"網格交易"
  description?: string;     // 策略說明
  color: string;           // 顯示顏色（用於圖表區分）
  createdAt: string;
}

/**
 * 交易記錄（Trading Transaction）
 * 擴展原有 Transaction 介面，新增交易特定欄位
 */
export interface TradingTransaction {
  id: string;
  ledgerId: string;         // 所屬帳本 ID
  strategyId?: string;      // 關聯策略 ID（選填）
  type: 'long' | 'short';   // 交易方向：做多或做空
  direction: 'long' | 'short'; // 別名，與 type 一致

  // 基本交易資訊
  ticker?: string;          // 股票/加密貨幣代號
  symbol?: string;          // ticker 的別名
  quantity?: number;        // 數量
  entryPrice?: number;      // 進場價格
  exitPrice?: number;       // 出場價格

  // 期貨特定欄位
  pointValue?: number;      // 點值（期貨）
  expiryDate?: string;      // 到期日（期貨/選擇權）

  // 費用與盈虧
  commission?: number;      // 手續費
  pnl?: number;            // 損益（自動計算）

  // 時間記錄
  date: string;            // 交易日期（ISO 8601）
  note?: string;           // 備註
  images?: string[];       // 圖片附件（Base64 字串陣列）
  createdAt: string;       // 建立時間
}

/**
 * 策略績效指標
 */
export interface StrategyMetrics {
  strategyId: string;
  totalTrades: number;      // 總交易次數
  winRate: number;          // 勝率（0-1）
  totalPnL: number;         // 總盈虧
  avgPnL: number;           // 平均盈虧
  sharpeRatio: number;      // 夏普比率
  maxDrawdown: number;      // 最大回撤（百分比）
  profitFactor: number;     // 獲利因子（總盈利/總虧損）
  avgWinLossRatio: number;  // 平均盈虧比
}

/**
 * 權益曲線資料點
 */
export interface EquityPoint {
  date: string;             // 日期
  equity: number;           // 權益值
  pnl: number;             // 當日盈虧
  // 可選的交易詳情（用於 hover 顯示）
  symbol?: string;
  direction?: 'long' | 'short';
  quantity?: number;
}
