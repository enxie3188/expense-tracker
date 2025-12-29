'use client';

import { useState, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { parseCSV, autoDetectMapping, convertCSVToTransactions, ColumnMapping, CSVData } from '@/lib/csvParser';
import { useTranslation } from '@/hooks/useTranslation';
import { TradingTransaction } from '@/types/ledger';

interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (transactions: TradingTransaction[]) => void;
    ledgerId: string;
}

export function CSVImportModal({ isOpen, onClose, onImport, ledgerId }: CSVImportModalProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
    const [csvData, setCSVData] = useState<CSVData | null>(null);
    const [mapping, setMapping] = useState<ColumnMapping | null>(null);
    const [preview, setPreview] = useState<TradingTransaction[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = parseCSV(text);

                if (data.headers.length === 0 || data.rows.length === 0) {
                    setError('CSV 檔案為空或格式錯誤');
                    return;
                }

                setCSVData(data);
                const detectedMapping = autoDetectMapping(data.headers);
                setMapping(detectedMapping);
                setError(null);
                setStep('mapping');
            } catch (err) {
                setError('解析 CSV 檔案時發生錯誤');
                console.error(err);
            }
        };
        reader.readAsText(file);
    }, []);

    const handleMappingChange = (field: keyof ColumnMapping, value: number) => {
        if (mapping) {
            setMapping({ ...mapping, [field]: value });
        }
    };

    const handlePreview = () => {
        if (!csvData || !mapping) return;

        const transactions = convertCSVToTransactions(csvData, mapping, ledgerId);
        setPreview(transactions);
        setStep('preview');
    };

    const handleImport = () => {
        onImport(preview);
        handleClose();
    };

    const handleClose = () => {
        setStep('upload');
        setCSVData(null);
        setMapping(null);
        setPreview([]);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    const fieldLabels: Record<keyof ColumnMapping, string> = {
        date: '日期 *',
        symbol: '標的 *',
        direction: '方向（選填）',
        entryPrice: '入場價（選填）',
        exitPrice: '出場價（選填）',
        quantity: '數量（選填）',
        pnl: '盈虧 *',
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet size={20} className="text-[var(--neon-green)]" />
                        <h2 className="text-lg font-semibold">CSV 導入</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">
                    {/* Step 1: Upload */}
                    {step === 'upload' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-[var(--border-default)] rounded-xl p-8 text-center">
                                <Upload size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                                <p className="text-lg mb-2">上傳 CSV 檔案</p>
                                <p className="text-sm text-[var(--text-muted)] mb-4">
                                    支援從 Excel 匯出的 CSV 格式
                                </p>
                                <label className="inline-block px-6 py-3 bg-[var(--neon-green)] text-black font-medium rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                                    選擇檔案
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="bg-[var(--bg-hover)] rounded-lg p-4">
                                <p className="font-medium mb-2">CSV 格式範例：</p>
                                <code className="text-sm text-[var(--text-muted)] block overflow-x-auto">
                                    日期,標的,方向,入場價,出場價,盈虧<br />
                                    2025/1/15,BTC,Long,42000,43500,750<br />
                                    2025/1/22,ETH,Long,2200,2350,750
                                </code>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Column Mapping */}
                    {step === 'mapping' && csvData && mapping && (
                        <div className="space-y-4">
                            <p className="text-sm text-[var(--text-muted)]">
                                請確認欄位對應是否正確。帶 * 標記的欄位為必填。
                            </p>

                            <div className="grid gap-3">
                                {(Object.keys(mapping) as Array<keyof ColumnMapping>).map((field) => (
                                    <div key={field} className="flex items-center gap-4">
                                        <label className="w-40 text-sm font-medium">
                                            {fieldLabels[field]}
                                        </label>
                                        <select
                                            value={mapping[field]}
                                            onChange={(e) => handleMappingChange(field, parseInt(e.target.value))}
                                            className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg"
                                        >
                                            <option value={-1}>-- 不使用 --</option>
                                            {csvData.headers.map((header, index) => (
                                                <option key={index} value={index}>
                                                    {header}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-[var(--bg-hover)] rounded-lg p-4">
                                <p className="font-medium mb-2">偵測到 {csvData.rows.length} 筆資料</p>
                                <p className="text-sm text-[var(--text-muted)]">
                                    前三筆資料預覽：
                                </p>
                                <div className="mt-2 overflow-x-auto">
                                    <table className="text-sm w-full">
                                        <thead>
                                            <tr className="border-b border-[var(--border-subtle)]">
                                                {csvData.headers.map((h, i) => (
                                                    <th key={i} className="px-2 py-1 text-left">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {csvData.rows.slice(0, 3).map((row, i) => (
                                                <tr key={i} className="border-b border-[var(--border-subtle)]">
                                                    {row.map((cell, j) => (
                                                        <td key={j} className="px-2 py-1">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === 'preview' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[var(--neon-green)]">
                                <CheckCircle size={20} />
                                <span>成功解析 {preview.length} 筆交易記錄</span>
                            </div>

                            <div className="bg-[var(--bg-hover)] rounded-lg p-4 max-h-64 overflow-y-auto">
                                <table className="text-sm w-full">
                                    <thead>
                                        <tr className="border-b border-[var(--border-subtle)]">
                                            <th className="px-2 py-1 text-left">日期</th>
                                            <th className="px-2 py-1 text-left">標的</th>
                                            <th className="px-2 py-1 text-left">方向</th>
                                            <th className="px-2 py-1 text-right">盈虧</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.slice(0, 10).map((tx, i) => (
                                            <tr key={i} className="border-b border-[var(--border-subtle)]">
                                                <td className="px-2 py-1">
                                                    {new Date(tx.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-2 py-1">{tx.symbol}</td>
                                                <td className="px-2 py-1">{tx.direction}</td>
                                                <td className={`px-2 py-1 text-right ${(tx.pnl ?? 0) >= 0 ? 'text-[var(--neon-green)]' : 'text-[var(--neon-pink)]'}`}>
                                                    {(tx.pnl ?? 0) >= 0 ? '+' : ''}{(tx.pnl ?? 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {preview.length > 10 && (
                                    <p className="text-center text-sm text-[var(--text-muted)] mt-2">
                                        ...還有 {preview.length - 10} 筆
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border-subtle)]">
                    {step === 'mapping' && (
                        <>
                            <button
                                onClick={() => setStep('upload')}
                                className="px-4 py-2 border border-[var(--border-default)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                            >
                                上一步
                            </button>
                            <button
                                onClick={handlePreview}
                                disabled={mapping?.date === -1 || mapping?.pnl === -1}
                                className="px-4 py-2 bg-[var(--neon-green)] text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                預覽
                            </button>
                        </>
                    )}
                    {step === 'preview' && (
                        <>
                            <button
                                onClick={() => setStep('mapping')}
                                className="px-4 py-2 border border-[var(--border-default)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                            >
                                上一步
                            </button>
                            <button
                                onClick={handleImport}
                                className="px-4 py-2 bg-[var(--neon-green)] text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
                            >
                                確認導入 {preview.length} 筆
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
