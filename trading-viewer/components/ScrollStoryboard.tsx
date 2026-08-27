'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  ZoomIn, 
  Bookmark, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Check
} from 'lucide-react';
import { Lesson } from '@/types/lesson';
import { getSlideImageUrl, getAdjacentLessons } from '@/lib/lessons';
import Link from 'next/link';

interface ScrollStoryboardProps {
  lesson: Lesson;
  activeSlideIndex: number;
  onSlideChange: (newIndex: number) => void;
  isSlideBookmarked: (lessonId: number, slideIndex: number) => boolean;
  onToggleBookmark: (lessonId: number, slideIndex: number) => void;
  getSlideNote: (lessonId: number, slideIndex: number) => string;
  saveNote: (lessonId: number, slideIndex: number, content: string) => void;
  onOpenZoom: (slideIndex: number) => void;
}

export function ScrollStoryboard({
  lesson,
  activeSlideIndex,
  onSlideChange,
  isSlideBookmarked,
  onToggleBookmark,
  getSlideNote,
  saveNote,
  onOpenZoom,
}: ScrollStoryboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const { nextLesson } = getAdjacentLessons(lesson.id);

  const [openNotes, setOpenNotes] = useState<Record<number, boolean>>({});
  const [savedNotesStatus, setSavedNotesStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-slide-index'));
            if (index && index !== activeSlideIndex) {
              onSlideChange(index);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -40% 0px',
        threshold: 0.2,
      }
    );

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeSlideIndex, onSlideChange, lesson.slides]);

  const toggleNoteCard = (slideIndex: number) => {
    setOpenNotes((prev) => ({ ...prev, [slideIndex]: !prev[slideIndex] }));
  };

  const handleNoteChange = (slideIndex: number, text: string) => {
    saveNote(lesson.id, slideIndex, text);
    setSavedNotesStatus((prev) => ({ ...prev, [slideIndex]: true }));
    setTimeout(() => {
      setSavedNotesStatus((prev) => ({ ...prev, [slideIndex]: false }));
    }, 2000);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-[#000000] px-4 sm:px-8 py-6 space-y-10 max-w-5xl mx-auto w-full"
    >
      {/* Lesson Header Banner */}
      <div className="p-6 sm:p-8 bg-[#161617] border border-white/[0.08] rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold text-[#2997ff] bg-white/[0.08] border border-white/[0.06] rounded-full uppercase tracking-wider">
              Bài {lesson.id} / 14
            </span>
            <span className="text-xs text-[#86868b] font-mono">
              {lesson.slide_count} slides phân tích
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f5f5f7] tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-xs text-[#86868b] leading-relaxed">
            Chế độ Storyboard cuộn liên tục. Bấm vào bất kỳ ảnh nào để phóng to 2K, ghi chú trực tiếp phía dưới mỗi biểu đồ.
          </p>
        </div>
      </div>

      {/* Slide Cards Stream */}
      <div className="space-y-8">
        {lesson.slides.map((s) => {
          const isBookmarked = isSlideBookmarked(lesson.id, s.slide_index);
          const currentNote = getSlideNote(lesson.id, s.slide_index);
          const hasNote = Boolean(currentNote && currentNote.trim().length > 0);
          const isNoteOpen = openNotes[s.slide_index] ?? hasNote;
          const isSaved = savedNotesStatus[s.slide_index];
          const imgUrl = getSlideImageUrl(lesson, s.slide_index);

          return (
            <div
              key={s.slide_index}
              ref={(el) => {
                if (el) slideRefs.current.set(s.slide_index, el);
                else slideRefs.current.delete(s.slide_index);
              }}
              data-slide-index={s.slide_index}
              className="bg-[#161617] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/[0.16] group"
            >
              {/* Slide Card Header */}
              <div className="p-3.5 sm:px-5 sm:py-3.5 bg-[#1c1c1e] border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-white/[0.08] text-[#2997ff] font-mono font-medium text-xs rounded-full border border-white/[0.06]">
                    BƯỚC {s.slide_index < 10 ? `0${s.slide_index}` : s.slide_index} / {lesson.slide_count}
                  </span>
                  <span className="text-xs text-[#86868b] font-mono hidden sm:inline">
                    {s.width} × {s.height}px
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bookmark Button */}
                  <button
                    onClick={() => onToggleBookmark(lesson.id, s.slide_index)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                      isBookmarked
                        ? 'bg-[#ffd60a]/20 border-[#ffd60a]/40 text-[#ffd60a]'
                        : 'bg-white/[0.08] border-white/[0.08] text-[#86868b] hover:text-white'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#ffd60a]' : ''}`} />
                    <span className="hidden sm:inline">
                      {isBookmarked ? 'Đã lưu' : 'Bookmark'}
                    </span>
                  </button>

                  {/* Toggle Note Button */}
                  <button
                    onClick={() => toggleNoteCard(s.slide_index)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                      hasNote
                        ? 'bg-[#30d158]/20 border-[#30d158]/40 text-[#30d158]'
                        : 'bg-white/[0.08] border-white/[0.08] text-[#86868b] hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ghi chú</span>
                  </button>

                  {/* Zoom Lightbox Button */}
                  <button
                    onClick={() => onOpenZoom(s.slide_index)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] rounded-full text-xs font-medium text-[#f5f5f7] transition"
                    title="Phóng to 2K"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#2997ff]" />
                    <span className="hidden sm:inline">Zoom 2K</span>
                  </button>
                </div>
              </div>

              {/* Chart Image Canvas */}
              <div
                onClick={() => onOpenZoom(s.slide_index)}
                className="relative bg-[#000000] p-3 sm:p-5 flex items-center justify-center cursor-zoom-in group/img overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Slide ${s.slide_index}`}
                  className="w-full max-h-[80vh] object-contain rounded-2xl border border-white/[0.08] shadow-2xl group-hover/img:scale-[1.008] transition-transform duration-300"
                  loading="lazy"
                />

                <div className="absolute bottom-4 right-4 px-3.5 py-1.5 bg-[#161617]/90 text-[#2997ff] border border-white/[0.08] rounded-full text-xs font-medium backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1.5 shadow-xl">
                  <ZoomIn className="w-3.5 h-3.5" /> Bấm để xem 2K chi tiết
                </div>
              </div>

              {/* Inline Personal Notes Box */}
              {isNoteOpen && (
                <div className="p-5 bg-[#1c1c1e] border-t border-white/[0.08] animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#f5f5f7] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#ffd60a]" />
                      Ghi chú cá nhân cho Slide {s.slide_index}
                    </span>
                    {isSaved && (
                      <span className="text-xs text-[#30d158] font-mono flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Đã lưu
                      </span>
                    )}
                  </div>

                  <textarea
                    value={currentNote}
                    onChange={(e) => handleNoteChange(s.slide_index, e.target.value)}
                    placeholder="Ghi lại nhận định, kiến thức về Volume, IMB, GAP, điểm vào lệnh cho slide này..."
                    className="w-full p-3.5 bg-black/40 border border-white/[0.08] rounded-2xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] resize-none h-24 font-sans leading-relaxed"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Next Lesson Navigation */}
      {nextLesson && (
        <div className="p-8 bg-[#161617] border border-white/[0.08] rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.08] text-[#30d158] rounded-full text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
            Bạn đã hoàn thành bài học này!
          </div>
          <h3 className="text-lg font-bold text-[#f5f5f7]">
            Tiếp tục bài tiếp theo: {nextLesson.title}
          </h3>
          <div>
            <Link
              href={`/lesson/${nextLesson.id}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium rounded-full shadow-lg transition-all hover:scale-105 text-sm"
            >
              Học bài tiếp theo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
