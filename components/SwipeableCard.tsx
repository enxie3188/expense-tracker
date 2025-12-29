'use client';

import { ReactNode, useRef, useState, TouchEvent, MouseEvent } from 'react';
import { Trash2 } from 'lucide-react';

interface SwipeableCardProps {
    children: ReactNode;
    onDelete: () => void;
    disabled?: boolean;
}

export function SwipeableCard({ children, onDelete, disabled = false }: SwipeableCardProps) {
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const currentXRef = useRef(0);

    const DELETE_THRESHOLD = -80; // Swipe 80px left to reveal delete
    const DELETE_BUTTON_WIDTH = 80;

    const handleTouchStart = (e: TouchEvent) => {
        if (disabled) return;
        startXRef.current = e.touches[0].clientX;
        currentXRef.current = translateX;
        setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging || disabled) return;

        const currentX = e.touches[0].clientX;
        const diff = currentX - startXRef.current;
        const newTranslateX = currentXRef.current + diff;

        // Only allow left swipe (negative values)
        if (newTranslateX <= 0 && newTranslateX >= DELETE_THRESHOLD) {
            setTranslateX(newTranslateX);
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging || disabled) return;
        setIsDragging(false);

        // Snap to delete position if past threshold, otherwise snap back
        if (translateX < DELETE_THRESHOLD / 2) {
            setTranslateX(DELETE_THRESHOLD);
        } else {
            setTranslateX(0);
        }
    };

    const handleDeleteClick = (e: MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    const resetPosition = () => {
        setTranslateX(0);
    };

    return (
        <div className="relative overflow-hidden">
            {/* Delete Button - Behind the card */}
            <div
                className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500"
                style={{ width: DELETE_BUTTON_WIDTH }}
            >
                <button
                    onClick={handleDeleteClick}
                    className="h-full w-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    aria-label="刪除"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Swipeable Card Content */}
            <div
                className="relative bg-[var(--bg-secondary)] transition-transform duration-200 ease-out touch-pan-y"
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={resetPosition}
            >
                {children}
            </div>
        </div>
    );
}
