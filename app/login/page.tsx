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
