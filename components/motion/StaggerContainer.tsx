'use client';

import { motion } from 'framer-motion';

// Container for staggered children animations
interface StaggerContainerProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
    initialDelay?: number;
}

export function StaggerContainer({
    children,
    className = '',
    staggerDelay = 0.05,
    initialDelay = 0,
}: StaggerContainerProps) {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 1 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: initialDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Child item for staggered animation
interface StaggerItemProps {
    children: React.ReactNode;
    className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
