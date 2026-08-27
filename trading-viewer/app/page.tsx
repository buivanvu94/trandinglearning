'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart2, 
  Play, 
  CheckCircle2, 
  Layers, 
  Bookmark, 
  FileText, 
  Search, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  ScrollText,
  ShieldCheck,
  LogOut,
  Settings,
  FolderPlus
} from 'lucide-react';
import { getSlideImageUrl } from '@/lib/lessons';
import { useLessons } from '@/hooks/useLessons';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useAuth } from '@/contexts/AuthContext';
import { BookmarksModal } from '@/components/BookmarksModal';

export default function CourseDashboardPage() {
  const { user, isAdmin, logout } = useAuth();
  const { lessons, totalSlides, isLoading: isLessonsLoading } = useLessons();

  const {
    progress,
    bookmarks,
    notes,
    toggleBookmark,
    stats,
  } = useCourseProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'bookmarked'>('all');
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  const lastActiveLesson = useMemo(() => {
    if (!lessons || lessons.length === 0) {
      return { lesson: { id: 1, title: 'Bài học', slide_count: 0 }, slide: 1 };
    }

    let latestLesson = lessons[0];
    let latestTime = 0;

    Object.entries(progress).forEach(([idStr, prog]) => {
      if (prog.lastViewedAt) {
        const time = new Date(prog.lastViewedAt).getTime();
        if (time > latestTime) {
          latestTime = time;
          const found = lessons.find((l) => l.id === parseInt(idStr, 10));
          if (found) latestLesson = found;
        }
      }
    });

    return {
      lesson: latestLesson,
      slide: progress[latestLesson.id]?.lastSlide || 1,
    };
  }, [progress, lessons]);

  const totalNotesCount = useMemo(() => {
    return Object.keys(notes).length;
  }, [notes]);

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch =
        !searchQuery.trim() ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.id.toString().includes(searchQuery);

      if (!matchesSearch) return false;

      const p = progress[lesson.id];
      if (filter === 'completed') {
        return p?.isCompleted;
      }
      if (filter === 'in_progress') {
        return p && !p.isCompleted && (p.completedSlides?.length || 0) > 0;
      }
      if (filter === 'bookmarked') {
        return bookmarks.some((b) => b.lessonId === lesson.id);
      }
      return true;
    });
  }, [searchQuery, filter, progress, bookmarks, lessons]);

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] antialiased flex flex-col selection:bg-[#2997ff]/30 font-sans">
      {/* Navigation Header */}
      <header className="border-b border-white/[0.08] bg-[#161617]/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2997ff] flex items-center justify-center text-white shadow-sm">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2997ff]">
                  Trading Masterclass
                </span>
                <span className="text-[10px] text-[#86868b]">
                  • 2K High Resolution
                </span>
              </div>
              <h1 className="text-sm font-semibold text-[#f5f5f7] tracking-tight">
                Price Action, Volume Profile & Cung Cầu
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Bookmarks Quick Pill */}
            {bookmarks.length > 0 && (
              <button
                onClick={() => setIsBookmarksOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#ffd60a] bg-[#ffd60a]/10 hover:bg-[#ffd60a]/20 border border-[#ffd60a]/20 rounded-full transition"
              >
                <Bookmark className="w-3.5 h-3.5 fill-[#ffd60a]" />
                <span>{bookmarks.length} Đánh dấu</span>
              </button>
            )}

            {/* Admin Console Switcher Button (Crucial requirement for Admin) */}
            {isAdmin && (
              <Link
                href="/admin/users"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#2997ff] to-[#0071e3] hover:from-[#0071e3] hover:to-[#005bb5] rounded-full shadow-md transition hover:scale-105 border border-white/[0.15]"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}

            {/* User Profile Pill & Logout */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/[0.10]">
                <div className="flex items-center gap-2 bg-[#1c1c1e] px-2.5 py-1 rounded-full border border-white/[0.06]">
                  <div className="w-5 h-5 rounded-full bg-[#2997ff]/20 text-[#2997ff] flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-[#f5f5f7] max-w-[100px] truncate hidden md:inline">
                    {user.name}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold uppercase ${
                      user.role === 'admin'
                        ? 'bg-[#2997ff]/20 text-[#2997ff]'
                        : 'bg-white/[0.08] text-[#86868b]'
                    }`}
                  >
                    {user.role === 'admin' ? 'Admin' : 'Học viên'}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Đăng xuất"
                  className="p-1.5 text-[#86868b] hover:text-[#ff453a] hover:bg-[#ff453a]/10 rounded-full transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Hero Banner & Stats Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Welcome & Resume Card */}
          <div className="lg:col-span-2 p-6 sm:p-8 bg-[#161617] border border-white/[0.08] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.08] text-[#2997ff] rounded-full text-xs font-medium border border-white/[0.06]">
                <Sparkles className="w-3.5 h-3.5" /> {lessons.length} Chuyên đề chuyên sâu
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-[#f5f5f7] tracking-tight leading-tight">
                Làm chủ Phân tích Cung Cầu, IMB & Vị thế Smart Money
              </h2>

              <p className="text-xs sm:text-sm text-[#86868b] max-w-2xl leading-relaxed">
                Tài liệu bài giảng trích xuất chuẩn xác độ phân giải cao $2K$. Trải nghiệm học tập trực quan với 2 chế độ trình chiếu (Slide Player & Storyboard cuộn liên tục), công cụ zoom soi từng cụm nến và ghi chú cá nhân tiện lợi.
              </p>
            </div>

            {/* Quick Resume Strip */}
            {lastActiveLesson.lesson && (
              <div className="relative z-10 mt-6 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center font-semibold text-[#2997ff] font-mono">
                    {lastActiveLesson.lesson.id}
                  </div>
                  <div>
                    <div className="text-[10px] text-[#86868b] uppercase font-medium">
                      Đang học dở
                    </div>
                    <div className="text-xs font-medium text-[#f5f5f7] truncate max-w-xs sm:max-w-md">
                      {lastActiveLesson.lesson.title}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/lesson/${lastActiveLesson.lesson.id}?slide=${lastActiveLesson.slide}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium rounded-full text-xs transition-all shadow-sm"
                >
                  Vào học ngay Slide {lastActiveLesson.slide} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Stats & Progress Metric Box */}
          <div className="p-6 sm:p-8 bg-[#161617] border border-white/[0.08] rounded-3xl shadow-2xl flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[#f5f5f7] flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-[#2997ff]" />
                Tiến độ học tập tổng quan
              </h3>
              <p className="text-xs text-[#86868b]">
                Theo dõi quá trình hoàn thành khóa học
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold font-mono text-[#f5f5f7]">
                  {stats.overallPercentage}%
                </span>
                <span className="text-xs text-[#86868b] font-mono">
                  {stats.completedSlidesCount} / {totalSlides || stats.totalSlides} slides
                </span>
              </div>

              <div className="w-full h-2 bg-[#1c1c1e] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2997ff] rounded-full transition-all duration-500"
                  style={{ width: `${stats.overallPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#1c1c1e] border border-white/[0.06] rounded-2xl">
                <div className="text-[11px] text-[#86868b] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" /> Bài hoàn thành
                </div>
                <div className="text-base font-semibold text-[#f5f5f7] font-mono mt-1">
                  {stats.completedLessonsCount} / {lessons.length}
                </div>
              </div>

              <div className="p-3 bg-[#1c1c1e] border border-white/[0.06] rounded-2xl">
                <div className="text-[11px] text-[#86868b] flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#ffd60a]" /> Ghi chú đã lưu
                </div>
                <div className="text-base font-semibold text-[#f5f5f7] font-mono mt-1">
                  {totalNotesCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3.5 bg-[#161617] border border-white/[0.08] rounded-2xl">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center bg-[#1c1c1e] p-0.5 rounded-xl border border-white/[0.06] text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
                filter === 'all'
                  ? 'bg-[#2c2c2e] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#f5f5f7]'
              }`}
            >
              Tất cả ({lessons.length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
                filter === 'in_progress'
                  ? 'bg-[#2c2c2e] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#f5f5f7]'
              }`}
            >
              Đang học
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
                filter === 'completed'
                  ? 'bg-[#2c2c2e] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#f5f5f7]'
              }`}
            >
              Đã xong
            </button>
            <button
              onClick={() => setFilter('bookmarked')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
                filter === 'bookmarked'
                  ? 'bg-[#2c2c2e] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#f5f5f7]'
              }`}
            >
              Đã lưu ({bookmarks.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài học..."
              className="w-full pl-9 pr-4 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff]"
            />
          </div>
        </div>

        {/* Lessons Curriculum Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
            const lessonProg = progress[lesson.id];
            const completedCount = lessonProg?.completedSlides?.length || 0;
            const isCompleted = lessonProg?.isCompleted || false;
            const progressRatio = (completedCount / (lesson.slide_count || 1)) * 100;
            const hasBookmark = bookmarks.some((b) => b.lessonId === lesson.id);
            const coverImageUrl = getSlideImageUrl(lesson, 1);

            return (
              <div
                key={lesson.id}
                className="group flex flex-col bg-[#161617] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl hover:border-white/[0.20] transition-all duration-300"
              >
                {/* Thumbnail Cover */}
                <Link
                  href={`/lesson/${lesson.id}`}
                  className="relative aspect-[16/10] bg-[#000000] overflow-hidden block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageUrl}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#161617]/90 text-[#2997ff] text-xs font-mono font-medium rounded-full border border-white/[0.08] backdrop-blur-md">
                      BÀI {lesson.id < 10 ? `0${lesson.id}` : lesson.id}
                    </span>

                    {hasBookmark && (
                      <span className="p-1.5 bg-[#161617]/90 text-[#ffd60a] rounded-full border border-white/[0.08] backdrop-blur-md">
                        <Bookmark className="w-3.5 h-3.5 fill-[#ffd60a]" />
                      </span>
                    )}
                  </div>

                  {/* Status Indicator */}
                  {isCompleted && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#161617]/90 text-[#30d158] text-xs font-medium rounded-full border border-white/[0.08] backdrop-blur-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                    </div>
                  )}

                  {/* Slide count badge */}
                  <div className="absolute bottom-3 left-3 text-xs text-[#86868b] font-mono flex items-center gap-1.5 bg-[#161617]/90 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/[0.08]">
                    <Layers className="w-3.5 h-3.5 text-[#2997ff]" />
                    {lesson.slide_count} slides biểu đồ
                  </div>
                </Link>

                {/* Card Content & Action Area */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-[#f5f5f7] group-hover:text-[#2997ff] transition-colors line-clamp-2 leading-snug">
                      {lesson.title}
                    </h3>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#86868b]">
                      <span>Tiến độ bài học</span>
                      <span className="font-mono text-[#f5f5f7]">
                        {completedCount} / {lesson.slide_count} slide
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1c1c1e] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2997ff] transition-all duration-300"
                        style={{ width: `${progressRatio}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
                    <Link
                      href={`/lesson/${lesson.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium rounded-full text-xs transition-all shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{completedCount > 0 ? 'Học tiếp' : 'Bắt đầu học'}</span>
                    </Link>

                    <Link
                      href={`/lesson/${lesson.id}`}
                      className="p-2 bg-white/[0.08] hover:bg-white/[0.14] text-[#f5f5f7] rounded-full border border-white/[0.08] transition"
                      title="Chế độ Storyboard cuộn liên tục"
                    >
                      <ScrollText className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#000000] py-8 text-center text-xs text-[#86868b]">
        <p>Hệ thống Học tập Phân tích Kỹ thuật Nâng cao • Trích xuất từ tài liệu nội bộ $2K$</p>
      </footer>

      {/* Bookmarks Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={(lId, sIdx) => toggleBookmark(lId, sIdx)}
      />
    </div>
  );
}
