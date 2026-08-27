'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Play, 
  ScrollText, 
  LayoutGrid, 
  ZoomIn, 
  Bookmark, 
  FileText, 
  Maximize2, 
  Minimize2, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson, ViewMode } from '@/types/lesson';
import { getAdjacentLessons } from '@/lib/lessons';

interface HeaderProps {
  lesson: Lesson;
  activeSlideIndex: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  hasNote: boolean;
  onOpenNotes: () => void;
  onOpenZoom: () => void;
  onOpenShortcuts: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function Header({
  lesson,
  activeSlideIndex,
  viewMode,
  onViewModeChange,
  isBookmarked,
  onToggleBookmark,
  hasNote,
  onOpenNotes,
  onOpenZoom,
  onOpenShortcuts,
  isFullscreen,
  onToggleFullscreen,
}: HeaderProps) {
  const { isAdmin } = useAuth();
  const { prevLesson, nextLesson } = getAdjacentLessons(lesson.id);
  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#161617]/85 backdrop-blur-xl px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Breadcrumbs & Navigation */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/"
          className="p-1.5 text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.08] rounded-full transition"
          title="Về danh sách bài học"
        >
          <Home className="w-4 h-4" />
        </Link>

        <div className="h-4 w-px bg-white/[0.08]" />

        {/* Prev / Next Lesson Buttons */}
        <div className="flex items-center gap-0.5">
          {prevLesson ? (
            <Link
              href={`/lesson/${prevLesson.id}`}
              className="p-1.5 text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.08] rounded-full transition"
              title={`Bài trước: ${prevLesson.title}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          ) : (
            <span className="p-1.5 text-white/20 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </span>
          )}

          {nextLesson ? (
            <Link
              href={`/lesson/${nextLesson.id}`}
              className="p-1.5 text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.08] rounded-full transition"
              title={`Bài kế tiếp: ${nextLesson.title}`}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="p-1.5 text-white/20 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>

        {/* Lesson Title */}
        <div className="flex items-center gap-2 truncate">
          <span className="px-2 py-0.5 text-xs font-semibold bg-white/[0.08] text-[#2997ff] border border-white/[0.06] rounded-full font-mono hidden sm:inline">
            Bài {lesson.id}/14
          </span>
          <h2 className="text-sm font-semibold text-[#f5f5f7] tracking-tight truncate">
            {lesson.title}
          </h2>
        </div>
      </div>

      {/* Right: View Modes & Action Tools */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Segmented View Mode Switcher */}
        <div className="flex items-center bg-[#1c1c1e] border border-white/[0.08] rounded-full p-0.5">
          <button
            onClick={() => onViewModeChange('slide')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition ${
              viewMode === 'slide'
                ? 'bg-[#0071e3] text-white shadow-sm font-medium'
                : 'text-[#86868b] hover:text-[#f5f5f7]'
            }`}
            title="Chế độ Slide Presentation (Phím 1)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">Slide Player</span>
          </button>

          <button
            onClick={() => onViewModeChange('scroll')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition ${
              viewMode === 'scroll'
                ? 'bg-[#0071e3] text-white shadow-sm font-medium'
                : 'text-[#86868b] hover:text-[#f5f5f7]'
            }`}
            title="Chế độ Storyboard cuộn liên tục (Phím 2)"
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cuộn liên tục</span>
          </button>

          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition ${
              viewMode === 'grid'
                ? 'bg-[#0071e3] text-white shadow-sm font-medium'
                : 'text-[#86868b] hover:text-[#f5f5f7]'
            }`}
            title="Chế độ Lưới tổng quan (Phím 3)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Lưới ảnh</span>
          </button>
        </div>

        <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Zoom Lightbox */}
          <button
            onClick={onOpenZoom}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#f5f5f7] bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] rounded-full transition"
            title="Phóng to 2K Inspector (Phím Z)"
          >
            <ZoomIn className="w-3.5 h-3.5 text-[#2997ff]" />
            <span className="font-mono hidden lg:inline">Zoom 2K</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-full border transition ${
              isBookmarked
                ? 'bg-[#ffd60a]/20 border-[#ffd60a]/40 text-[#ffd60a]'
                : 'bg-white/[0.08] border-white/[0.08] text-[#86868b] hover:text-[#ffd60a] hover:bg-white/[0.14]'
            }`}
            title={isBookmarked ? 'Bỏ đánh dấu slide (Phím B)' : 'Đánh dấu slide này (Phím B)'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#ffd60a]' : ''}`} />
          </button>

          {/* Note Drawer */}
          <button
            onClick={onOpenNotes}
            className={`relative p-2 rounded-full border transition ${
              hasNote
                ? 'bg-[#30d158]/20 border-[#30d158]/40 text-[#30d158]'
                : 'bg-white/[0.08] border-white/[0.08] text-[#86868b] hover:text-[#30d158] hover:bg-white/[0.14]'
            }`}
            title="Ghi chú slide (Phím N)"
          >
            <FileText className="w-4 h-4" />
            {hasNote && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#30d158] rounded-full animate-pulse" />
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 text-[#86868b] hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] rounded-full transition hidden sm:block"
            title={isFullscreen ? 'Thoát toàn màn hình (Phím F)' : 'Toàn màn hình (Phím F)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Keyboard Shortcuts */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 text-[#86868b] hover:text-[#2997ff] bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] rounded-full transition"
            title="Xem phím tắt"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {isAdmin && (
            <Link
              href="/admin/lessons"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-full shadow transition ml-1"
              title="Về bảng Quản trị Bài học"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
