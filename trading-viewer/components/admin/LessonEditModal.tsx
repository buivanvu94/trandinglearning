'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';

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

interface LessonEditModalProps {
  lesson: LessonAdminItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LessonEditModal({
  lesson,
  isOpen,
  onClose,
  onSuccess,
}: LessonEditModalProps) {
  const [title, setTitle] = useState('');
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setOrderIndex(lesson.order_index);
      setDescription(lesson.description || '');
      setErrorMsg(null);
    }
  }, [lesson]);

  if (!isOpen || !lesson) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Tiêu đề bài học không được để trống.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          order_index: Number(orderIndex),
          description: description.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.message || 'Lỗi cập nhật bài học.');
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#161617] border border-white/[0.12] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-6 p-6 sm:p-7 relative">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2997ff]/20 text-[#2997ff] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#f5f5f7]">
                Chỉnh Sửa Chuyên Đề
              </h3>
              <p className="text-xs text-[#86868b]">Bài ID #{lesson.id} • {lesson.slide_count} slides</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#86868b] hover:text-[#f5f5f7] rounded-xl hover:bg-white/[0.06] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-xl text-xs text-[#ff453a]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#a1a1a6]">
              Tiêu đề bài giảng
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#a1a1a6]">
              Thứ tự hiển thị (Order Index)
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 1)}
              min={1}
              className="w-full px-3.5 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#a1a1a6]">
              Mô tả chuyên đề
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#f5f5f7] rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
