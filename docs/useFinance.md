# useFinance Hook 使用說明

## 核心功能

`useFinance` 是極簡記帳 App 的核心 Custom Hook，提供完整的財務資料管理功能。

## 功能特性

✅ **自動持久化**：資料自動同步到 LocalStorage  
✅ **即時統計**：自動計算總收入、總支出和餘額  
✅ **完整 TypeScript 支援**：所有介面都有完整型別定義  
✅ **CRUD 操作**：提供交易和分類的完整增刪改查功能  

## 使用範例

### 基本用法

\`\`\`tsx
'use client';

import { useFinance } from '@/hooks/useFinance';

export default function Dashboard() {
  const {
    transactions,
    stats,
    addTransaction,
    deleteTransaction,
    isLoading,
  } = useFinance();

  if (isLoading) {
    return <div>載入中...</div>;
  }

  return (
    <div>
      <h1>財務總覽</h1>
      
      {/* 統計資料 */}
      <div>
        <p>總收入：{stats.totalIncome / 100} 元</p>
        <p>總支出：{stats.totalExpense / 100} 元</p>
        <p>餘額：{stats.balance / 100} 元</p>
      </div>

      {/* 交易列表 */}
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.note} - {t.amount / 100} 元
            <button onClick={() => deleteTransaction(t.id)}>刪除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

### 新增交易

\`\`\`tsx
const { addTransaction } = useFinance();

// 新增一筆支出
addTransaction({
  type: 'expense',
  amount: 15000, // 150 元（以分為單位）
  category: 'food',
  date: new Date().toISOString(),
  note: '午餐',
});

// 新增一筆收入
addTransaction({
  type: 'income',
  amount: 5000000, // 50000 元
  category: 'salary',
  date: new Date().toISOString(),
  note: '月薪',
});
\`\`\`

### 刪除交易

\`\`\`tsx
const { deleteTransaction } = useFinance();

deleteTransaction('transaction-id-here');
\`\`\`

### 更新交易

\`\`\`tsx
const { updateTransaction } = useFinance();

updateTransaction('transaction-id-here', {
  amount: 20000, // 更新金額為 200 元
  note: '更新後的備註',
});
\`\`\`

## API 文件

### 回傳值

| 屬性 | 類型 | 說明 |
|------|------|------|
| `transactions` | `Transaction[]` | 所有交易記錄 |
| `categories` | `Category[]` | 所有分類 |
| `stats` | `FinancialStats` | 統計資料（總收入、總支出、餘額） |
| `isLoading` | `boolean` | 是否正在載入資料 |
| `addTransaction` | `function` | 新增交易 |
| `updateTransaction` | `function` | 更新交易 |
| `deleteTransaction` | `function` | 刪除交易 |
| `addCategory` | `function` | 新增分類 |
| `updateCategory` | `function` | 更新分類 |
| `deleteCategory` | `function` | 刪除分類 |
| `clearAllData` | `function` | 清除所有資料 |

### 型別定義

#### Transaction
\`\`\`typescript
interface Transaction {
  id: string;              // UUID
  type: 'income' | 'expense';
  amount: number;          // 以分為單位
  category: string;        // 分類 ID
  date: string;            // ISO 8601 格式
  note?: string;           // 備註
  createdAt: string;       // 建立時間
}
\`\`\`

#### FinancialStats
\`\`\`typescript
interface FinancialStats {
  totalIncome: number;     // 總收入（分）
  totalExpense: number;    // 總支出（分）
  balance: number;         // 餘額（分）
}
\`\`\`

## 注意事項

⚠️ **金額單位**：所有金額都以「分」為單位儲存，避免浮點數精度問題。顯示時需除以 100。

⚠️ **Client Component**：此 Hook 使用 LocalStorage，只能在 Client Component 中使用。

⚠️ **自動儲存**：交易和分類的任何變更都會自動儲存到 LocalStorage。

## 工具函式

專案還提供了額外的工具函式：

\`\`\`typescript
import { formatAmount, convertToCents } from '@/lib/calculations';

// 格式化金額
formatAmount(15000); // "NT$150"

// 轉換元為分
convertToCents(150); // 15000
\`\`\`
