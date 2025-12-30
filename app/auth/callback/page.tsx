'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

/**
 * 將詳細的錯誤訊息轉換為通用的使用者友善訊息
 * 避免洩漏系統內部資訊
 */
function sanitizeErrorMessage(error: string | null): string {
    if (!error) return '驗證失敗，請重試';

    // 記錄詳細錯誤到 console（僅開發環境）
    if (process.env.NODE_ENV === 'development') {
        console.error('Auth error:', error);
    }

    // 返回通用錯誤訊息
    const errorLower = error.toLowerCase();

    if (errorLower.includes('email') || errorLower.includes('verification')) {
        return '電子郵件驗證失敗，請檢查您的信箱';
    }
    if (errorLower.includes('code') || errorLower.includes('invalid')) {
        return '驗證碼無效或已過期';
    }
    if (errorLower.includes('network') || errorLower.includes('timeout')) {
        return '網路連線問題，請重試';
    }

    // 預設通用訊息
    return '登入驗證失敗，請重新嘗試';
}

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('驗證中...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const supabase = createClient();

            // 首先檢查用戶是否已經登入（驗證可能已經完成）
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setStatus('驗證成功！正在跳轉...');
                router.push('/dashboard');
                return;
            }

            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');

            if (errorParam) {
                const sanitizedError = sanitizeErrorMessage(errorDescription || errorParam);
                setError(sanitizedError);
                setStatus('驗證失敗');
                setTimeout(() => router.push('/login?error=' + encodeURIComponent(sanitizedError)), 3000);
                return;
            }

            if (!code) {
                // 沒有 code 也沒有 session，可能連結有問題
                const sanitizedError = sanitizeErrorMessage('no_code');
                setError(sanitizedError);
                setStatus('驗證失敗');
                setTimeout(() => router.push('/login?error=' + encodeURIComponent(sanitizedError)), 3000);
                return;
            }

            try {
                setStatus('正在處理驗證...');
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                if (exchangeError) {
                    // 再次檢查是否已登入（可能在此期間完成）
                    const { data: { session: retrySession } } = await supabase.auth.getSession();
                    if (retrySession) {
                        setStatus('驗證成功！正在跳轉...');
                        router.push('/dashboard');
                        return;
                    }

                    const sanitizedError = sanitizeErrorMessage(exchangeError.message);
                    setError(sanitizedError);
                    setStatus('驗證失敗');
                    setTimeout(() => router.push('/login?error=' + encodeURIComponent(sanitizedError)), 3000);
                    return;
                }

                setStatus('驗證成功！正在跳轉...');
                router.push('/dashboard');
            } catch (e) {
                setError(e instanceof Error ? e.message : '未知錯誤');
                setStatus('驗證失敗');
                setTimeout(() => router.push('/login?error=callback_failed'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="text-center p-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] max-w-md">
            <div className="mb-4">
                {!error ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--neon-blue)] mx-auto"></div>
                ) : (
                    <div className="text-4xl">❌</div>
                )}
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                {status}
            </h2>
            {error && (
                <p className="text-[var(--text-secondary)] text-sm">
                    {error}
                </p>
            )}
            {error && (
                <p className="text-[var(--text-muted)] text-xs mt-4">
                    3 秒後將返回登入頁面...
                </p>
            )}
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="text-center p-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] max-w-md">
            <div className="mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--neon-blue)] mx-auto"></div>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                載入中...
            </h2>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <Suspense fallback={<LoadingFallback />}>
                <AuthCallbackContent />
            </Suspense>
        </div>
    );
}
