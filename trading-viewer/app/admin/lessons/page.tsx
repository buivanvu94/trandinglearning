'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FolderArchive, 
  Layers, 
  Plus, 
  Search, 
  RefreshCw, 
  Play, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { LessonZipUploadModal } from '@/components/admin/LessonZipUploadModal';
import { LessonEditModal } from '@/components/admin/LessonEditModal';

interface LessonAdminItem {
  id: number;
  title: string;
  folder_name: string;
  slide_count: number;
  order_index: number;
  description: string | null;
  created_at: string;
  first_slide: string | null;
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonAdminItem[]>([]);
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalSlides: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isZipOpen, setIsZipOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonAdminItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/lessons');
      if (res.ok) {
        const data = await res.json();
        setLessons(data.lessons || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin lessons:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleDeleteLesson = async (id: number, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa bài học "${title}" và toàn bộ slide liên quan không?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/lessons/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchLessons();
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const newLessons = [...lessons];
    const temp = newLessons[index];
    newLessons[index] = newLessons[targetIndex];
    newLessons[targetIndex] = temp;

    // Update order_index for all
    const items = newLessons.map((l, i) => ({
      id: l.id,
      order_index: i + 1,
    }));

    setLessons(
      newLessons.map((l, i) => ({
        ...l,
        order_index: i + 1,
      }))
    );

    try {
      await fetch('/api/admin/lessons/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
    } catch (err) {
      console.error('Error reordering lessons:', err);
      await fetchLessons();
    }
  };

  const filteredLessons = lessons.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return l.title.toLowerCase().includes(q) || l.id.toString().includes(q);
  });

  return (
    <div className="space-y-8">
      {/* Top Banner & Stats */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f7]">
              Quản Trị Bài Học & Trích Xuất ZIP
            </h1>
            <p className="text-xs text-[#86868b] mt-1">
              Thêm mới bài học bằng cách tải lên tệp ZIP chứa ảnh 2K, sắp xếp thứ tự và cập nhật giáo trình.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchLessons()}
              className="p-2.5 bg-[#161617] hover:bg-[#1f1f21] border border-white/[0.08] text-[#86868b] hover:text-[#f5f5f7] rounded-xl transition cursor-pointer"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#2997ff]' : ''}`} />
            </button>

            {/* Featured Action: Upload ZIP */}
            <button
              onClick={() => setIsZipOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl shadow-lg transition hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Import Bài Học Bằng ZIP</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-[#161617] border border-white/[0.08] rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[#86868b]">Tổng Chuyên Đề</span>
              <div className="text-3xl font-bold font-mono text-[#f5f5f7]">
                {stats.totalLessons}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#2997ff]/10 text-[#2997ff] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 bg-[#161617] border border-white/[0.08] rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[#86868b]">Tổng Slide Hình Ảnh 2K</span>
              <div className="text-3xl font-bold font-mono text-[#30d158]">
                {stats.totalSlides}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#30d158]/10 text-[#30d158] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 bg-[#161617] border border-white/[0.08] rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[#86868b]">Cơ Chế Nạp Dữ Liệu</span>
              <div className="text-xs font-semibold text-[#ffd60a] flex items-center gap-1.5 mt-2">
                <FolderArchive className="w-4 h-4" />
                <span>Auto-Extract ZIP Image Matrix</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 p-3.5 bg-[#161617] border border-white/[0.08] rounded-2xl">
        <div className="text-xs font-semibold text-[#f5f5f7]">
          Danh sách chuyên đề ({filteredLessons.length})
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài học..."
            className="w-full pl-9 pr-4 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff]"
          />
        </div>
      </div>

      {/* Lessons List Grid */}
      <div className="space-y-3">
        {filteredLessons.length === 0 ? (
          <div className="p-12 text-center bg-[#161617] border border-white/[0.08] rounded-3xl text-[#86868b] space-y-3">
            <FolderArchive className="w-10 h-10 mx-auto text-[#86868b]/40" />
            <p className="text-xs">Chưa có bài học nào hoặc không tìm thấy bài học phù hợp.</p>
            <button
              onClick={() => setIsZipOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0071e3] text-white text-xs font-semibold rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Import file ZIP đầu tiên</span>
            </button>
          </div>
        ) : (
          filteredLessons.map((lesson, idx) => {
            const coverUrl = lesson.first_slide
              ? `/lessons/${lesson.first_slide.split('/').map(encodeURIComponent).join('/')}`
              : null;

            return (
              <div
                key={lesson.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-[#161617] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl transition-all group"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-[#86868b] hover:text-[#2997ff] disabled:opacity-20 hover:bg-white/[0.04] rounded transition"
                      title="Chuyển lên trên"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(idx, 'down')}
                      disabled={idx === filteredLessons.length - 1}
                      className="p-1 text-[#86868b] hover:text-[#2997ff] disabled:opacity-20 hover:bg-white/[0.04] rounded transition"
                      title="Chuyển xuống dưới"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Order Index Pill */}
                  <div className="w-8 h-8 rounded-xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-[#2997ff] font-mono shrink-0">
                    {lesson.order_index}
                  </div>

                  {/* Slide Thumbnail Preview */}
                  <div className="w-16 h-10 rounded-lg bg-[#000000] border border-white/[0.08] overflow-hidden shrink-0 relative flex items-center justify-center">
                    {coverUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={coverUrl}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Layers className="w-4 h-4 text-[#86868b]" />
                    )}
                  </div>

                  {/* Title & Stats */}
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#f5f5f7] tracking-tight truncate group-hover:text-[#2997ff] transition">
                      {lesson.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#86868b]">
                      <span className="inline-flex items-center gap-1 text-[#30d158]">
                        <Layers className="w-3 h-3" />
                        <strong>{lesson.slide_count}</strong> slides 2K
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[10px] truncate max-w-xs">
                        {lesson.folder_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                  <Link
                    href={`/lesson/${lesson.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1e] hover:bg-[#252527] border border-white/[0.08] hover:border-white/[0.20] text-xs font-medium text-[#f5f5f7] rounded-xl transition"
                  >
                    <Play className="w-3 h-3 text-[#2997ff] fill-current" />
                    <span>Xem Thử</span>
                    <ExternalLink className="w-2.5 h-2.5 text-[#86868b]" />
                  </Link>

                  <button
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setIsEditOpen(true);
                    }}
                    className="p-2 text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.06] rounded-xl transition cursor-pointer"
                    title="Chỉnh sửa tên bài"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                    className="p-2 text-[#86868b] hover:text-[#ff453a] hover:bg-[#ff453a]/10 rounded-xl transition cursor-pointer"
                    title="Xóa bài học"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <LessonZipUploadModal
        isOpen={isZipOpen}
        onClose={() => setIsZipOpen(false)}
        onSuccess={() => fetchLessons()}
      />

      <LessonEditModal
        lesson={selectedLesson}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedLesson(null);
        }}
        onSuccess={() => fetchLessons()}
      />
    </div>
  );
}
