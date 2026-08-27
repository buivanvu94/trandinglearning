'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Move
} from 'lucide-react';
import { Lesson } from '@/types/lesson';
import { getSlideImageUrl } from '@/lib/lessons';

interface ZoomModalProps {
  lesson: Lesson;
  activeSlideIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigateSlide?: (newIndex: number) => void;
}

export function ZoomModal({
  lesson,
  activeSlideIndex,
  isOpen,
  onClose,
  onNavigateSlide,
}: ZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSlide = lesson.slides.find((s) => s.slide_index === activeSlideIndex) || lesson.slides[0];
  const imageUrl = getSlideImageUrl(lesson, activeSlideIndex);

  const resetTransform = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetTransform();
    }
  }, [isOpen, activeSlideIndex, resetTransform]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onNavigateSlide) {
        if (activeSlideIndex < lesson.slide_count) {
          onNavigateSlide(activeSlideIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' && onNavigateSlide) {
        if (activeSlideIndex > 1) {
          onNavigateSlide(activeSlideIndex - 1);
        }
      } else if (e.key === '+' || e.key === '=') {
        setScale((prev) => Math.min(prev + 0.25, 4.5));
      } else if (e.key === '-' || e.key === '_') {
        setScale((prev) => Math.max(prev - 0.25, 0.5));
      } else if (e.key === '0' || e.key === 'r') {
        resetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeSlideIndex, lesson.slide_count, onClose, onNavigateSlide, resetTransform]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((prev) => {
      const next = Math.max(0.5, Math.min(prev + zoomFactor, 4.5));
      return Math.round(next * 100) / 100;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      resetTransform();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-2xl select-none animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.08] bg-[#161617]/90">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2997ff] bg-white/[0.08] border border-white/[0.06] rounded-full">
            HD 2K Inspector
          </span>
          <h3 className="text-sm font-medium text-[#f5f5f7] truncate max-w-md">
            {lesson.title} — Slide {activeSlideIndex} / {lesson.slide_count}
          </h3>
          <span className="text-xs text-[#86868b] font-mono hidden sm:inline">
            ({currentSlide.width} × {currentSlide.height}px)
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Buttons */}
          <div className="flex items-center bg-[#1c1c1e] border border-white/[0.08] rounded-full p-1">
            <button
              onClick={() => setScale((prev) => Math.max(prev - 0.25, 0.5))}
              className="p-1.5 text-[#86868b] hover:text-white hover:bg-white/[0.08] rounded-full transition"
              title="Thu nhỏ (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-[#f5f5f7] min-w-[52px] text-center font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((prev) => Math.min(prev + 0.25, 4.5))}
              className="p-1.5 text-[#86868b] hover:text-white hover:bg-white/[0.08] rounded-full transition"
              title="Phóng to (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetTransform}
              className="p-1.5 text-[#86868b] hover:text-white hover:bg-white/[0.08] rounded-full transition ml-1 border-l border-white/[0.08]"
              title="Đặt lại (0 hoặc R)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Download Original */}
          <a
            href={imageUrl}
            download={currentSlide.filename}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#f5f5f7] hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] rounded-full transition"
            title="Tải ảnh gốc 2K"
          >
            <Download className="w-3.5 h-3.5 text-[#2997ff]" />
            <span className="hidden sm:inline">Tải ảnh gốc</span>
          </a>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 text-[#86868b] hover:text-white hover:bg-white/[0.12] rounded-full transition ml-1"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        className={`relative flex-1 overflow-hidden flex items-center justify-center cursor-${
          scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative max-w-full max-h-full transition-transform origin-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Slide ${activeSlideIndex}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/[0.08] pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* Slide Navigation Arrows */}
        {onNavigateSlide && (
          <>
            {activeSlideIndex > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateSlide(activeSlideIndex - 1);
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-[#86868b] hover:text-white bg-[#1c1c1e]/90 hover:bg-[#0071e3] border border-white/[0.08] rounded-full shadow-2xl backdrop-blur-xl transition group"
                title="Slide trước (Mũi tên trái)"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}

            {activeSlideIndex < lesson.slide_count && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateSlide(activeSlideIndex + 1);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-[#86868b] hover:text-white bg-[#1c1c1e]/90 hover:bg-[#0071e3] border border-white/[0.08] rounded-full shadow-2xl backdrop-blur-xl transition group"
                title="Slide sau (Mũi tên phải)"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </>
        )}

        {/* Helper Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#161617]/90 border border-white/[0.08] rounded-full text-xs text-[#86868b] backdrop-blur-xl flex items-center gap-3 pointer-events-none shadow-xl">
          <span className="flex items-center gap-1">
            <Move className="w-3.5 h-3.5 text-[#2997ff]" /> Cuộn chuột để zoom, Kéo để di chuyển
          </span>
          <span className="text-white/20">•</span>
          <span>Double-click để zoom 2x</span>
        </div>
      </div>
    </div>
  );
}
