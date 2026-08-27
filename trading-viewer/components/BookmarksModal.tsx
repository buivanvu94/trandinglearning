'use client';

import React from 'react';
import { X, Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { Bookmark as BookmarkType } from '@/types/lesson';
import { LESSONS, getSlideImageUrl } from '@/lib/lessons';
import Link from 'next/link';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkType[];
  onRemoveBookmark: (lessonId: number, slideIndex: number) => void;
  onNavigateToSlide?: (lessonId: number, slideIndex: number) => void;
}

export function BookmarksModal({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onNavigateToSlide,
}: BookmarksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#161617] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/[0.08] text-[#ffd60a] border border-white/[0.06] rounded-xl">
              <Bookmark className="w-4 h-4 fill-[#ffd60a]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f5f5f7]">Danh sách Slide Đã đánh dấu</h3>
              <p className="text-xs text-[#86868b]">
                {bookmarks.length} biểu đồ quan trọng đã lưu để ôn tập
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#86868b] hover:text-white hover:bg-white/[0.08] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {bookmarks.length === 0 ? (
            <div className="py-12 text-center text-[#86868b] flex flex-col items-center">
              <Bookmark className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm text-[#f5f5f7]">Chưa có slide nào được đánh dấu.</p>
              <p className="text-xs text-[#86868b] mt-1">
                Nhấn phím <kbd className="px-2 py-0.5 bg-[#1c1c1e] rounded text-[#2997ff] border border-white/[0.08]">B</kbd> hoặc nút Bookmark khi xem bài học để lưu lại biểu đồ quan trọng.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookmarks.map((bm) => {
                const lesson = LESSONS.find((l) => l.id === bm.lessonId);
                if (!lesson) return null;
                const imgUrl = getSlideImageUrl(lesson, bm.slideIndex);

                return (
                  <div
                    key={`${bm.lessonId}_${bm.slideIndex}`}
                    className="flex flex-col bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.20] transition group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-[#000000] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Slide ${bm.slideIndex}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-[#161617]/90 backdrop-blur-md rounded-full text-[11px] font-medium text-[#ffd60a] border border-white/[0.08]">
                        Slide {bm.slideIndex}
                      </div>
                      <button
                        onClick={() => onRemoveBookmark(bm.lessonId, bm.slideIndex)}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-[#ff453a] text-white rounded-full transition"
                        title="Xóa đánh dấu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-medium text-[#f5f5f7] line-clamp-2 leading-snug">
                          {lesson.title}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[11px] text-[#86868b] font-mono">
                          {new Date(bm.addedAt).toLocaleDateString('vi-VN')}
                        </span>

                        {onNavigateToSlide ? (
                          <button
                            onClick={() => {
                              onNavigateToSlide(bm.lessonId, bm.slideIndex);
                              onClose();
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-[#2997ff] hover:text-[#0077ed] transition"
                          >
                            Học ngay <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <Link
                            href={`/lesson/${bm.lessonId}?slide=${bm.slideIndex}`}
                            onClick={onClose}
                            className="flex items-center gap-1 text-xs font-medium text-[#2997ff] hover:text-[#0077ed] transition"
                          >
                            Học ngay <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
