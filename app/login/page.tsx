'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AlphaLogLogo } from '@/components/brand/AlphaLogLogo';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (mode === 'register') {
                if (password !== confirmPassword) {
                    setError('密碼不一致');
                    setLoading(false);
                    return;
                }
                if (password.length < 6) {
                    setError('密碼至少需要 6 個字元');
                    setLoading(false);
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;
                setSuccess('註冊成功！請查看您的信箱以驗證帳號。');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : '發生未知錯誤';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Google 登入失敗';
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <div
                className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                }}
            >
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <AlphaLogLogo className="w-16 h-16" />
                    </div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {mode === 'login' ? '歡迎回來' : '建立帳號'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {mode === 'login' ? '登入以同步您的交易記錄' : '開始追蹤您的交易旅程'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            電子郵件
                        </label>
                        <div className="relative">
                            <Mail
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                style={{ color: 'var(--text-muted)' }}
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--bg-hover)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            密碼
                        </label>
                        <div className="relative">
                            <Lock
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                style={{ color: 'var(--text-muted)' }}
                            />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={mode === 'register' ? 6 : undefined}
                                className="w-full pl-10 pr-12 py-3 rounded-xl outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--bg-hover)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password (Register only) */}
                    {mode === 'register' && (
                        <div>
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                確認密碼
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--bg-hover)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-subtle)',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Remember Me (Login only) */}
                    {mode === 'login' && (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setRememberMe(!rememberMe)}
                                className="w-5 h-5 rounded flex items-center justify-center transition-all"
                                style={{
                                    backgroundColor: rememberMe ? 'var(--neon-blue)' : 'transparent',
                                    border: rememberMe ? 'none' : '2px solid var(--border-subtle)',
                                }}
                            >
                                {rememberMe && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                            <span
                                className="text-sm cursor-pointer"
                                style={{ color: 'var(--text-secondary)' }}
                                onClick={() => setRememberMe(!rememberMe)}
                            >
                                保持登入
                            </span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div
                            className="p-3 rounded-xl text-sm"
                            style={{
                                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                                color: '#F43F5E',
                                border: '1px solid rgba(244, 63, 94, 0.2)',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div
                            className="p-3 rounded-xl text-sm"
                            style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                color: '#10B981',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                            }}
                        >
                            {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{
                            backgroundColor: 'var(--neon-blue)',
                            color: 'white',
                        }}
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {mode === 'login' ? '登入' : '註冊'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" style={{ borderColor: 'var(--border-subtle)' }}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                            或
                        </span>
                    </div>
                </div>

                {/* Google Login Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    style={{
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                    }}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    使用 Google 帳號登入
                </button>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setMode(mode === 'login' ? 'register' : 'login');
                            setError(null);
                            setSuccess(null);
                        }}
                        className="text-sm transition-colors"
                        style={{ color: 'var(--neon-blue)' }}
                    >
                        {mode === 'login' ? '還沒有帳號？立即註冊' : '已有帳號？立即登入'}
                    </button>
                </div>
            </div>
        </div>
    );
}
