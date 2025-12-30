'use client';

import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Sidebar } from "@/components/Sidebar";
import { TradingForm } from "@/components/TradingForm";
import { CyberBackground } from "@/components/layout/CyberBackground";
import { useState, useEffect } from "react";
import { SettingsProvider } from "@/hooks/useSettings";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { LoadingScreen } from "@/components/motion";
import { AnimatePresence, motion } from "framer-motion";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <title>AlphaLog - A Quantitative Trading Journal</title>
        <meta name="description" content="Master Your Edge with AlphaLog" />

        {/* PWA Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0B1120" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AlphaLog" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300`}
      >
        <AuthProvider>
          <SettingsProvider>
            <FinanceProvider>
              <LayoutContent>{children}</LayoutContent>
            </FinanceProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const pathname = usePathname();

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  // Listen for custom event from page buttons
  useEffect(() => {
    const handleOpenForm = () => setIsModalOpen(true);
    window.addEventListener('openAddTransaction', handleOpenForm as EventListener);
    return () => window.removeEventListener('openAddTransaction', handleOpenForm as EventListener);
  }, []);

  // First load completed
  useEffect(() => {
    if (isFirstLoad) {
      const timer = setTimeout(() => setIsFirstLoad(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isFirstLoad]);

  // Check if on login page - render without sidebar
  const isAuthPage = pathname === '/login' || pathname?.startsWith('/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Initial Loading Screen */}
      {isFirstLoad && <LoadingScreen minDuration={800} />}

      <div className="flex h-screen relative">
        <CyberBackground />
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 relative z-10">
          {/* Page Transition Animation using CSS */}
          <div
            key={pathname}
            className="h-full animate-page-in"
          >
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Navigation onAddClick={handleAddClick} />
        </div>

        {/* Trading Form Modal */}
        <TradingForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </>
  );
}
