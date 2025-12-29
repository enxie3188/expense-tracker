import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: "#0B1120",     // 極深海軍藍 (主背景)
                    card: "#111827",     // 稍淺的卡片背景
                    primary: "#06B6D4",  // 電光青 (Logo 主色)
                    accent: "#3B82F6",   // 向上箭頭的藍色 (更專業的藍)
                    success: "#10B981",
                    muted: "#64748B",
                },
            },
            fontFamily: {
                mono: ["var(--font-jetbrains-mono)", "monospace"],
                sans: ["var(--font-inter)", "sans-serif"],
            },
            backgroundImage: {
                'cyber-pattern': "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)",
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
            },
        },
    },
    plugins: [],
};
export default config;
