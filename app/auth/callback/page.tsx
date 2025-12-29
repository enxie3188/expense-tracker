'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

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
                setError(errorDescription || errorParam);
                setStatus('驗證失敗');
                setTimeout(() => router.push('/login?error=' + encodeURIComponent(errorDescription || errorParam)), 3000);
                return;
            }

            if (!code) {
                // 沒有 code 也沒有 session，可能連結有問題
                setError('缺少驗證碼');
                setStatus('驗證失敗');
                setTimeout(() => router.push('/login?error=no_code'), 3000);
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

                    setError(exchangeError.message);
                    setStatus('驗證失敗');
                    setTimeout(() => router.push('/login?error=' + encodeURIComponent(exchangeError.message)), 3000);
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
