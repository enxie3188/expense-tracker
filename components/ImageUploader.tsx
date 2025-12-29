'use client';

import { useState, useRef } from 'react';
import { Camera, X, ImageIcon, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/imageUtils';

interface ImageUploaderProps {
    images: string[];
    onImagesChange: (newImages: string[]) => void;
    maxImages?: number;
}

export function ImageUploader({ images, onImagesChange, maxImages = 3 }: ImageUploaderProps) {
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        if (images.length + files.length > maxImages) {
            alert(`最多只能上傳 ${maxImages} 張圖片`);
            return;
        }

        setIsCompressing(true);
        const newImages: string[] = [...images];

        try {
            for (let i = 0; i < files.length; i++) {
                const compressed = await compressImage(files[i]);
                newImages.push(compressed);
            }
            onImagesChange(newImages);
        } catch (error) {
            console.error('Image compression failed:', error);
            alert('圖片處理失敗，請重試');
        } finally {
            setIsCompressing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressing || images.length >= maxImages}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--neon-blue)] bg-[var(--neon-blue)]/10 hover:bg-[var(--neon-blue)]/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCompressing ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Camera size={14} />
                        )}
                        添加圖片 ({images.length}/{maxImages})
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {/* Thumbnail Grip */}
            {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {images.map((img, index) => (
                        <div key={index} className="relative group">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--border-default)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img}
                                    alt={`Attachment ${index + 1}`}
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => {
                                        // Open preview (simple implementation: open in new tab)
                                        const win = window.open();
                                        if (win) {
                                            win.document.write(`<img src="${img}" style="max-width:100%; height:auto;">`);
                                        }
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
