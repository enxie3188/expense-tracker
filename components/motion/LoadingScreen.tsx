'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LoadingScreenProps {
    minDuration?: number;
}

export function LoadingScreen({ minDuration = 800 }: LoadingScreenProps) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, minDuration);

        return () => clearTimeout(timer);
    }, [minDuration]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--bg-primary)]"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {/* Logo Animation */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="text-4xl font-bold bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent"
                        >
                            AlphaLog
                        </motion.div>

                        {/* Loading Bar */}
                        <div className="w-48 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{
                                    duration: 0.8,
                                    ease: 'easeInOut',
                                    repeat: Infinity,
                                }}
                                className="h-full w-1/2 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] rounded-full"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
