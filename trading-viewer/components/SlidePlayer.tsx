'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  Play, 
  Pause, 
  Bookmark, 
  FileText, 
  Maximize2,
  ArrowRight
} from 'lucide-react';
import { Lesson } from '@/types/lesson';
import { getSlideImageUrl, getAdjacentLessons } from '@/lib/lessons';
import Link from 'next/link';

interface SlidePlayerProps {
  lesson: Lesson;
  activeSlideIndex: number;
  onSlideChange: (newIndex: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  hasNote: boolean;
  onOpenNotes: () => void;
  onOpenZoom: () => void;
  onToggleFullscreen: () => void;
}

export function SlidePlayer({
  lesson,
  activeSlideIndex,
  onSlideChange,
  isBookmarked,
  onToggleBookmark,
  hasNote,
  onOpenNotes,
  onOpenZoom,
  onToggleFullscreen,
}: SlidePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState<number>(5);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const { nextLesson } = getAdjacentLessons(lesson.id);
  const isLastSlide = activeSlideIndex >= lesson.slide_count;

  const currentSlide =
    lesson.slides.find((s) => s.slide_index === activeSlideIndex) || lesson.slides[0];
  const imageUrl = getSlideImageUrl(lesson, activeSlideIndex);

  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeEl = thumbnailsRef.current.querySelector(
        `[data-thumb-index="${activeSlideIndex}"]`
      ) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeSlideIndex]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      onSlideChange(
        activeSlideIndex < lesson.slide_count ? activeSlideIndex + 1 : 1
      );
    }, playInterval * 1000);

    return () => clearInterval(timer);
  }, [isPlaying, activeSlideIndex, lesson.slide_count, playInterval, onSlideChange]);

  const handleNext = useCallback(() => {
    if (activeSlideIndex < lesson.slide_count) {
      onSlideChange(activeSlideIndex + 1);
    }
  }, [activeSlideIndex, lesson.slide_count, onSlideChange]);

  const handlePrev = useCallback(() => {
    if (activeSlideIndex > 1) {
      onSlideChange(activeSlideIndex - 1);
    }
  }, [activeSlideIndex, onSlideChange]);

  return (
    <div className="flex-1 flex flex-col bg-[#000000] overflow-hidden relative select-none">
      {/* Top Slide Progress Bar */}
      <div className="w-full h-[2px] bg-[#1c1c1e] overflow-hidden">
        <div
          className="h-full bg-[#2997ff] transition-all duration-300"
          style={{
            width: `${(activeSlideIndex / lesson.slide_count) * 100}%`,
          }}
        />
      </div>

      {/* Main Presentation Stage */}
      <div className="flex-1 relative flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Click Zones for Navigation */}
        <div
          onClick={handlePrev}
          className="absolute inset-y-0 left-0 w-1/4 z-10 cursor-pointer group flex items-center justify-start pl-4"
          title="Slide trước (←)"
        >
          {activeSlideIndex > 1 && (
            <div className="p-3 bg-[#1c1c1e]/80 border border-white/[0.08] text-[#86868b] group-hover:text-white group-hover:bg-[#2c2c2e] rounded-full shadow-2xl backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0">
              <ChevronLeft className="w-6 h-6" />
            </div>
          )}
        </div>

        <div
          onClick={handleNext}
          className="absolute inset-y-0 right-0 w-1/4 z-10 cursor-pointer group flex items-center justify-end pr-4"
          title="Slide sau (→ hoặc Space)"
        >
          {activeSlideIndex < lesson.slide_count && (
            <div className="p-3 bg-[#1c1c1e]/80 border border-white/[0.08] text-[#86868b] group-hover:text-white group-hover:bg-[#2c2c2e] rounded-full shadow-2xl backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
              <ChevronRight className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* High-Resolution Chart Display */}
        <div
          onClick={onOpenZoom}
          className="relative max-w-full max-h-[72vh] flex items-center justify-center cursor-zoom-in group/img"
          title="Bấm vào để mở Zoom Inspector 2K"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`${lesson.title} - Slide ${activeSlideIndex}`}
            className="max-h-[72vh] max-w-full w-auto object-contain rounded-2xl border border-white/[0.08] shadow-2xl group-hover/img:border-white/[0.18] transition-all duration-300"
          />

          {/* Quick Zoom Pill on hover */}
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-[#161617]/90 text-[#2997ff] border border-white/[0.08] rounded-full text-xs font-medium backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1.5 shadow-lg">
            <ZoomIn className="w-3.5 h-3.5" /> Phóng to 2K
          </div>

          {/* Slide badge on top left */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-[#161617]/90 text-[#f5f5f7] border border-white/[0.08] rounded-full text-xs font-mono font-medium backdrop-blur-md">
            Slide {activeSlideIndex} / {lesson.slide_count}
          </div>
        </div>

        {/* Next Lesson Callout */}
        {isLastSlide && nextLesson && (
          <div className="absolute bottom-6 right-6 z-20 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <Link
              href={`/lesson/${nextLesson.id}`}
              className="flex items-center gap-3 p-3.5 bg-[#1c1c1e]/95 border border-white/[0.12] hover:border-[#2997ff]/60 rounded-2xl shadow-2xl backdrop-blur-xl text-white group transition-all"
            >
              <div className="p-2 bg-[#0071e3] text-white rounded-xl font-medium">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-semibold text-[#2997ff]">
                  Bài học tiếp theo
                </div>
                <div className="text-xs font-semibold max-w-[200px] truncate text-[#f5f5f7]">
                  {nextLesson.title}
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Floating HUD Controller */}
      <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#161617]/90 backdrop-blur-xl flex items-center justify-between z-20">
        {/* Left: Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={activeSlideIndex <= 1}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-30 disabled:hover:bg-white/[0.08] border border-white/[0.08] rounded-full text-xs font-medium text-[#f5f5f7] transition"
          >
            <ChevronLeft className="w-4 h-4" /> Trước
          </button>

          <span className="px-3 py-1 bg-[#1c1c1e] border border-white/[0.08] rounded-full text-xs font-mono font-medium text-[#2997ff]">
            {activeSlideIndex} / {lesson.slide_count}
          </span>

          <button
            onClick={handleNext}
            disabled={activeSlideIndex >= lesson.slide_count}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-30 disabled:hover:bg-[#0071e3] text-white rounded-full text-xs font-medium transition shadow-sm"
          >
            Sau <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Autoplay Slideshow */}
        <div className="flex items-center gap-2 bg-[#1c1c1e] border border-white/[0.08] rounded-full px-3 py-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 text-xs font-medium transition ${
              isPlaying ? 'text-[#ffd60a]' : 'text-[#86868b] hover:text-white'
            }`}
            title={isPlaying ? 'Tạm dừng trình chiếu tự động' : 'Bắt đầu trình chiếu tự động'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Tạm dừng
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Tự động chạy
              </>
            )}
          </button>

          <select
            value={playInterval}
            onChange={(e) => setPlayInterval(Number(e.target.value))}
            className="bg-black/50 border border-white/[0.08] rounded px-1.5 py-0.5 text-[11px] text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]"
          >
            <option value={3}>3s</option>
            <option value={5}>5s</option>
            <option value={8}>8s</option>
            <option value={12}>12s</option>
          </select>
        </div>

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-full border transition ${
              isBookmarked
                ? 'bg-[#ffd60a]/20 border-[#ffd60a]/40 text-[#ffd60a]'
                : 'bg-white/[0.08] border-white/[0.08] text-[#86868b] hover:text-white'
            }`}
            title="Đánh dấu slide"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#ffd60a]' : ''}`} />
          </button>

          <button
            onClick={onOpenNotes}
            className={`p-2 rounded-full border transition ${
              hasNote
                ? 'bg-[#30d158]/20 border-[#30d158]/40 text-[#30d158]'
                : 'bg-white/[0.08] border-white/[0.08] text-[#86868b] hover:text-white'
            }`}
            title="Ghi chú"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenZoom}
            className="p-2 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] rounded-full text-[#86868b] hover:text-[#2997ff] transition"
            title="Mở Zoom 2K"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-2 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] rounded-full text-[#86868b] hover:text-white transition hidden sm:block"
            title="Toàn màn hình"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filmstrip / Thumbnail Carousel at Bottom */}
      <div className="p-2.5 border-t border-white/[0.08] bg-[#000000]">
        <div
          ref={thumbnailsRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-2"
        >
          {lesson.slides.map((s) => {
            const isActive = s.slide_index === activeSlideIndex;
            const thumbUrl = getSlideImageUrl(lesson, s.slide_index);

            return (
              <button
                key={s.slide_index}
                data-thumb-index={s.slide_index}
                onClick={() => onSlideChange(s.slide_index)}
                className={`relative flex-shrink-0 w-24 sm:w-28 aspect-video rounded-xl overflow-hidden border transition-all duration-200 group ${
                  isActive
                    ? 'border-[#2997ff] ring-2 ring-[#2997ff]/40 scale-105 shadow-xl'
                    : 'border-white/[0.08] opacity-60 hover:opacity-100 hover:border-white/[0.24]'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbUrl}
                  alt={`Thumb ${s.slide_index}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  className={`absolute bottom-1 left-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${
                    isActive
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-black/80 text-[#86868b]'
                  }`}
                >
                  {s.slide_index}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
