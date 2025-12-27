# 極簡記帳 App

一個簡潔優雅的個人財務管理應用程式，採用 Next.js 14 開發，提供直觀的交易追蹤和財務分析功能。

## ✨ 功能特點

### 📊 交易管理
- **快速記帳**：一鍵新增收入/支出交易
- **分類管理**：預設多種收支分類（飲食、交通、娛樂等）
- **日期分組**：交易按日期自動分組，可展開查看詳情
- **即時統計**：自動計算當月收入、支出和餘額

### 📈 財務分析
- **月度報表**：圓餅圖展示收支分類分布
- **年度趨勢**：柱狀圖顯示全年收支變化
- **數據視覺化**：使用 Recharts 呈現清晰的財務數據

### 🎨 設計特色
- **淺色主題**：清爽的視覺設計，優秀的可讀性
- **響應式佈局**：適配不同螢幕尺寸
- **流暢動畫**：舒適的交互體驗
- **簡約界面**：專注於核心功能，無多餘元素

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 運行開發伺服器
```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 建置生產版本
```bash
npm run build
npm start
```

## 🛠️ 技術棧

- **框架**：Next.js 14 (App Router)
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **圖表**：Recharts
- **日期選擇**：react-datepicker
- **圖標**：Lucide React
- **數據儲存**：LocalStorage

## 📁 專案結構

```
expense-tracker/
├── app/                    # Next.js App Router 頁面
│   ├── page.tsx           # 首頁（交易列表）
│   ├── analytics/         # 財務分析頁面
│   ├── layout.tsx         # 全域佈局
│   └── globals.css        # 全域樣式
├── components/            # React 組件
│   ├── DateGroup.tsx      # 日期分組組件
│   ├── MonthPicker.tsx    # 月份選擇器
│   ├── Navigation.tsx     # 底部導航
│   └── ui/                # UI 組件
├── hooks/                 # 自定義 Hooks
│   └── useFinance.ts      # 財務數據管理
├── lib/                   # 工具函式
│   ├── storage.ts         # LocalStorage 管理
│   ├── calculations.ts    # 財務計算
│   ├── analytics.ts       # 分析工具
│   └── dateUtils.ts       # 日期工具
└── types/                 # TypeScript 類型定義
```

## 💡 使用說明

### 新增交易
1. 點擊底部紅色 **+** 按鈕
2. 選擇收入或支出
3. 選擇分類
4. 輸入金額
5. 選擇日期（可選）
6. 添加備註（可選）
7. 點擊「新增交易」

### 查看分析
1. 點擊底部「分析」按鈕
2. 切換「月度報表」或「年度報表」
3. 查看圓餅圖和柱狀圖數據
4. 使用月份選擇器切換不同月份

### 管理交易
- 在交易列表中懸停可顯示「刪除」按鈕
- 點擊日期分組標題可展開/摺疊該天的交易
- 使用月份選擇器查看不同月份的數據

## 📝 數據儲存

所有數據儲存在瀏覽器的 LocalStorage 中，包括：
- 交易記錄
- 自定義分類（如需要）

**注意**：清除瀏覽器數據會導致記帳資料遺失，請定期備份重要數據。

## 🎯 未來規劃

- [ ] 數據匯出功能（CSV/PDF）
- [ ] 預算設定和警示
- [ ] 搜尋和篩選功能
- [ ] 自定義分類
- [ ] 深色模式切換
- [ ] 雲端同步
- [ ] 多帳戶支援

## 📄 授權

MIT License

## 👨‍💻 作者

Built with ❤️ using Next.js
