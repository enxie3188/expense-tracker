'use client';

import { ChevronDown } from 'lucide-react';
import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsSectionProps {
    title: string;
    icon: ReactNode;
    description?: string;
    children: ReactNode;
    defaultExpanded?: boolean;
}

export function SettingsSection({
    title,
    icon,
    description,
    children,
    defaultExpanded = false,
}: SettingsSectionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="card-dark overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-6 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="text-[var(--neon-blue)]">{icon}</div>
                    <div className="text-left">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        {description && (
                            <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
                        )}
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={20} className="text-[var(--text-muted)]" />
                </motion.div>
            </button>

            {/* Content with animation */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="px-6 pb-6 border-t border-[var(--border-subtle)] pt-6">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
