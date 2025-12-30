'use client';

// Re-export everything from FinanceContext
// This maintains backward compatibility with existing imports from '@/hooks/useFinance'

export { useFinance, FinanceProvider } from '@/contexts/FinanceContext';
export type { FinanceContextValue, SyncStatus } from '@/contexts/FinanceContext';

// For backward compatibility, also export UseFinanceReturn as an alias
export type { FinanceContextValue as UseFinanceReturn } from '@/contexts/FinanceContext';
