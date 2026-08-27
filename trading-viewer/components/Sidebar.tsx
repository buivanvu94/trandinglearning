'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  CheckCircle2, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  BarChart2
} from 'lucide-react';
import { LESSONS } from '@/lib/lessons';
import { LessonProgress, Bookmark as BookmarkType } from '@/types/lesson';

interface SidebarProps {
  progress: Record<number, LessonProgress>;
  bookmarks: BookmarkType[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenBookmarksModal?: () => void;
}

export function Sidebar({
  progress,
  bookmarks,
  isCollapsed,
  onToggleCollapse,
  onOpenBookmarksModal,
}: SidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'bookmarked'>('all');

  const currentLessonId = useMemo(() => {
    const match = pathname.match(/\/lesson\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }, [pathname]);

  const totalSlides = useMemo(() => LESSONS.reduce((acc, l) => acc + l.slide_count, 0), []);
  const completedSlidesCount = useMemo(() => {
    return Object.values(progress).reduce(
      (sum, p) => sum + (p.completedSlides ? p.completedSlides.length : 0),
      0
    );
  }, [progress]);
  const progressPercent = totalSlides > 0 ? Math.round((completedSlidesCount / totalSlides) * 100) : 0;

  const filteredLessons = useMemo(() => {
    return LESSONS.filter((lesson) => {
      const matchesSearch =
        !searchQuery.trim() ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.id.toString().includes(searchQuery);

      if (!matchesSearch) return false;

      if (filter === 'completed') {
        return progress[lesson.id]?.isCompleted;
      }
      if (filter === 'bookmarked') {
        return bookmarks.some((b) => b.lessonId === lesson.id);
      }
      return true;
    });
  }, [searchQuery, filter, progress, bookmarks]);

  return (
    <aside
      className={`h-screen bg-[#161617]/95 border-r border-white/[0.08] backdrop-blur-2xl flex flex-col transition-all duration-300 z-40 relative select-none ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        {!isCollapsed ? (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#2997ff] flex items-center justify-center text-white shadow-sm group-hover:bg-[#0077ed] transition-colors">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#2997ff] uppercase tracking-wider">
                Masterclass
              </div>
              <h1 className="text-sm font-semibold text-[#f5f5f7] tracking-tight group-hover:text-white transition-colors truncate">
                Cung Cầu & Volume
              </h1>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto" title="Trang chủ Masterclass">
            <div className="w-8 h-8 rounded-lg bg-[#2997ff] flex items-center justify-center text-white">
              <BarChart2 className="w-4 h-4" />
            </div>
          </Link>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.08] rounded-full transition"
          title={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress Widget (when not collapsed) */}
      {!isCollapsed && (
        <div className="p-4 border-b border-white/[0.08] bg-black/30">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#86868b] font-medium">Tiến độ khóa học</span>
            <span className="font-mono font-semibold text-[#2997ff]">{progressPercent}%</span>
          </div>

          <div className="w-full h-1.5 bg-[#2c2c2e] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2997ff] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#86868b] mt-2.5">
            <span>
              Đã học: <strong className="text-[#f5f5f7] font-medium">{completedSlidesCount}</strong> / {totalSlides} slide
            </span>
            {bookmarks.length > 0 && onOpenBookmarksModal && (
              <button
                onClick={onOpenBookmarksModal}
                className="text-[#ffd60a] hover:text-[#ffe040] flex items-center gap-1 font-medium transition"
              >
                <Bookmark className="w-3 h-3 fill-[#ffd60a]" /> {bookmarks.length} lưu
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search & Filter (when not collapsed) */}
      {!isCollapsed && (
        <div className="p-3 border-b border-white/[0.08] space-y-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài học..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#1c1c1e] border border-white/[0.08] rounded-lg text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex bg-[#1c1c1e] p-0.5 rounded-lg border border-white/[0.06] text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 rounded-md transition font-medium text-center ${
                filter === 'all'
                  ? 'bg-[#2c2c2e] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#f5f5f7]'
              }`}
            >
              Tất cả ({LESSONS.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`flex-1 py-1 rounded-md transition font-medium text-center ${
                filter === 'completed'
                  ? 'bg-[#2c2c2e] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#f5f5f7]'
              }`}
            >
              Đã xong
            </button>
            <button
              onClick={() => setFilter('bookmarked')}
              className={`flex-1 py-1 rounded-md transition font-medium text-center ${
                filter === 'bookmarked'
                  ? 'bg-[#2c2c2e] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#f5f5f7]'
              }`}
            >
              Đã lưu
            </button>
          </div>
        </div>
      )}

      {/* Lesson List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredLessons.length === 0 ? (
          <div className="py-8 text-center text-[#86868b] text-xs">
            Không tìm thấy bài học phù hợp.
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            const isActive = currentLessonId === lesson.id;
            const lessonProg = progress[lesson.id];
            const completedInLesson = lessonProg?.completedSlides?.length || 0;
            const isDone = lessonProg?.isCompleted || false;
            const hasBookmark = bookmarks.some((b) => b.lessonId === lesson.id);

            return (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                className={`group flex items-start gap-2.5 p-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-[#0071e3] text-white shadow-sm'
                    : 'hover:bg-white/[0.06] text-[#f5f5f7]'
                }`}
                title={isCollapsed ? `${lesson.id}. ${lesson.title}` : undefined}
              >
                {/* Lesson Number & Status Badge */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold font-mono transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isDone
                        ? 'bg-[#30d158]/20 text-[#30d158]'
                        : 'bg-white/[0.08] text-[#86868b] group-hover:text-[#f5f5f7]'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" /> : lesson.id}
                  </div>
                </div>

                {/* Lesson Info (when not collapsed) */}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-xs font-medium leading-snug line-clamp-2 transition-colors ${
                        isActive ? 'text-white font-semibold' : 'text-[#f5f5f7]'
                      }`}
                    >
                      {lesson.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span
                        className={`flex items-center gap-1 font-mono ${
                          isActive ? 'text-white/80' : 'text-[#86868b]'
                        }`}
                      >
                        <Layers className="w-3 h-3" />
                        {completedInLesson}/{lesson.slide_count} slides
                      </span>

                      {hasBookmark && (
                        <span className={isActive ? 'text-white' : 'text-[#ffd60a]'} title="Có slide đánh dấu">
                          <Bookmark className="w-3 h-3 fill-current" />
                        </span>
                      )}

                      {isDone && !isActive && (
                        <span className="text-[#30d158] text-[10px] font-medium">
                          Hoàn thành
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>

      {/* Footer info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-white/[0.08] text-center text-[11px] text-[#86868b]">
          <span>Apple Pro Educational Architecture</span>
        </div>
      )}
    </aside>
  );
}
