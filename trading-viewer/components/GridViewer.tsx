'use client';

import React from 'react';
import { 
  ZoomIn, 
  Bookmark, 
  FileText, 
  Play, 
  Layers
} from 'lucide-react';
import { Lesson } from '@/types/lesson';
import { getSlideImageUrl } from '@/lib/lessons';

interface GridViewerProps {
  lesson: Lesson;
  activeSlideIndex: number;
  onSelectSlide: (slideIndex: number) => void;
  isSlideBookmarked: (lessonId: number, slideIndex: number) => boolean;
  onToggleBookmark: (lessonId: number, slideIndex: number) => void;
  getSlideNote: (lessonId: number, slideIndex: number) => string;
  onOpenZoom: (slideIndex: number) => void;
}

export function GridViewer({
  lesson,
  activeSlideIndex,
  onSelectSlide,
  isSlideBookmarked,
  onToggleBookmark,
  getSlideNote,
  onOpenZoom,
}: GridViewerProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#000000] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 text-xs font-semibold bg-white/[0.08] text-[#2997ff] border border-white/[0.06] rounded-full">
                Bài {lesson.id}
              </span>
              <h2 className="text-lg font-bold text-[#f5f5f7]">{lesson.title}</h2>
            </div>
            <p className="text-xs text-[#86868b]">
              Tổng quan toàn bộ {lesson.slide_count} biểu đồ trong bài học. Bấm vào bất kỳ slide nào để bắt đầu học hoặc soi chi tiết.
            </p>
          </div>

          <div className="text-xs text-[#86868b] font-mono flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#2997ff]" /> {lesson.slide_count} slides
          </div>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {lesson.slides.map((s) => {
            const isBookmarked = isSlideBookmarked(lesson.id, s.slide_index);
            const hasNote = Boolean(getSlideNote(lesson.id, s.slide_index)?.trim());
            const isActive = s.slide_index === activeSlideIndex;
            const imgUrl = getSlideImageUrl(lesson, s.slide_index);

            return (
              <div
                key={s.slide_index}
                className={`flex flex-col bg-[#161617] border rounded-2xl overflow-hidden shadow-xl transition-all duration-200 group ${
                  isActive
                    ? 'border-[#2997ff] ring-2 ring-[#2997ff]/40'
                    : 'border-white/[0.08] hover:border-white/[0.20] hover:scale-[1.015]'
                }`}
              >
                {/* Thumbnail Stage */}
                <div
                  onClick={() => onSelectSlide(s.slide_index)}
                  className="relative aspect-video bg-[#000000] overflow-hidden cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Slide ${s.slide_index}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Slide number badge */}
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-[#161617]/90 backdrop-blur-md rounded-full text-xs font-mono font-medium text-[#2997ff] border border-white/[0.08]">
                    Slide {s.slide_index}
                  </div>

                  {/* Hover Overlay Play Icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity flex items-center justify-center">
                    <div className="p-3 bg-[#0071e3] text-white rounded-full font-medium shadow-xl">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-[#1c1c1e] border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {hasNote && (
                      <span
                        className="px-2 py-0.5 bg-[#30d158]/20 text-[#30d158] border border-[#30d158]/30 rounded-full text-[10px] flex items-center gap-1"
                        title="Có ghi chú cá nhân"
                      >
                        <FileText className="w-3 h-3" /> Ghi chú
                      </span>
                    )}

                    {isBookmarked && (
                      <span
                        className="px-2 py-0.5 bg-[#ffd60a]/20 text-[#ffd60a] border border-[#ffd60a]/30 rounded-full text-[10px] flex items-center gap-1"
                        title="Đã đánh dấu"
                      >
                        <Bookmark className="w-3 h-3 fill-[#ffd60a]" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(lesson.id, s.slide_index);
                      }}
                      className={`p-1.5 rounded-full border transition ${
                        isBookmarked
                          ? 'bg-[#ffd60a]/20 border-[#ffd60a]/40 text-[#ffd60a]'
                          : 'bg-white/[0.08] border-white/[0.08] text-[#86868b] hover:text-white'
                      }`}
                      title="Đánh dấu"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#ffd60a]' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenZoom(s.slide_index);
                      }}
                      className="p-1.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] rounded-full text-[#86868b] hover:text-[#2997ff] transition"
                      title="Mở Zoom 2K"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
