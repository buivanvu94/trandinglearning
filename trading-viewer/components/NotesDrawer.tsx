'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Trash2, 
  Download, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Lesson } from '@/types/lesson';

interface NotesDrawerProps {
  lesson: Lesson;
  activeSlideIndex: number;
  isOpen: boolean;
  onClose: () => void;
  getSlideNote: (lessonId: number, slideIndex: number) => string;
  saveNote: (lessonId: number, slideIndex: number, content: string) => void;
  onJumpToSlide: (slideIndex: number) => void;
}

export function NotesDrawer({
  lesson,
  activeSlideIndex,
  isOpen,
  onClose,
  getSlideNote,
  saveNote,
  onJumpToSlide,
}: NotesDrawerProps) {
  const [currentText, setCurrentText] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');

  useEffect(() => {
    const existing = getSlideNote(lesson.id, activeSlideIndex);
    setCurrentText(existing);
  }, [lesson.id, activeSlideIndex, getSlideNote, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCurrentText(val);
    saveNote(lesson.id, activeSlideIndex, val);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Bạn có chắc muốn xóa ghi chú của slide này?')) {
      setCurrentText('');
      saveNote(lesson.id, activeSlideIndex, '');
    }
  };

  const allLessonNotes = lesson.slides
    .map((s) => ({
      slideIndex: s.slide_index,
      note: getSlideNote(lesson.id, s.slide_index),
    }))
    .filter((s) => s.note && s.note.trim().length > 0);

  const handleExportNotes = () => {
    if (allLessonNotes.length === 0) {
      alert('Chưa có ghi chú nào trong bài học này để xuất.');
      return;
    }

    const content = allLessonNotes
      .map(
        (n) =>
          `=== BÀI HỌC: ${lesson.title} - SLIDE ${n.slideIndex} ===\n${n.note}\n\n`
      )
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ghi-chu-${lesson.folder_name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#161617]/95 border-l border-white/[0.08] shadow-2xl backdrop-blur-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/[0.08] text-[#ffd60a] rounded-xl border border-white/[0.06]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f5f5f7]">Sổ tay Ghi chú</h3>
            <p className="text-xs text-[#86868b]">
              {lesson.title} • Slide {activeSlideIndex}
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

      {/* Segmented Tabs */}
      <div className="p-3 border-b border-white/[0.08] bg-black/20">
        <div className="flex bg-[#1c1c1e] p-0.5 rounded-lg border border-white/[0.06] text-xs">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-1.5 rounded-md transition font-medium text-center ${
              activeTab === 'current'
                ? 'bg-[#2c2c2e] text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#f5f5f7]'
            }`}
          >
            Slide hiện tại ({activeSlideIndex})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 rounded-md transition font-medium text-center ${
              activeTab === 'all'
                ? 'bg-[#2c2c2e] text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#f5f5f7]'
            }`}
          >
            Tất cả ({allLessonNotes.length})
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {activeTab === 'current' ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#f5f5f7] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ffd60a]" />
                Ghi chú cá nhân (Tự động lưu)
              </span>
              {isSaved && (
                <span className="text-xs text-[#30d158] flex items-center gap-1 font-mono">
                  <Check className="w-3.5 h-3.5" /> Đã lưu
                </span>
              )}
            </div>

            <textarea
              value={currentText}
              onChange={handleChange}
              placeholder="Nhập kiến thức quan trọng, điểm vào lệnh, bối cảnh nến hoặc lưu ý cá nhân cho slide này..."
              className="flex-1 w-full p-4 bg-[#1c1c1e] border border-white/[0.08] rounded-2xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] resize-none font-sans leading-relaxed"
            />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.08] text-xs text-[#86868b]">
              <span>{currentText.length} ký tự</span>
              {currentText.length > 0 && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 text-[#ff453a] hover:text-[#ff6961] transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa ghi chú
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#86868b]">
                {allLessonNotes.length} slide có ghi chú trong bài này
              </span>
              {allLessonNotes.length > 0 && (
                <button
                  onClick={handleExportNotes}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#f5f5f7] hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] rounded-full transition"
                >
                  <Download className="w-3 h-3 text-[#2997ff]" /> Xuất .txt
                </button>
              )}
            </div>

            {allLessonNotes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#86868b]">
                <FileText className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm text-[#f5f5f7]">Chưa có ghi chú nào cho bài học này.</p>
                <p className="text-xs text-[#86868b] mt-1">
                  Chuyển sang tab &quot;Slide hiện tại&quot; để thêm ghi chú đầu tiên.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {allLessonNotes.map((item) => (
                  <div
                    key={item.slideIndex}
                    className="p-3.5 bg-[#1c1c1e] border border-white/[0.08] rounded-2xl hover:border-white/[0.18] transition group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-white/[0.08] text-[#2997ff] border border-white/[0.06] rounded-full">
                        Slide {item.slideIndex}
                      </span>
                      <button
                        onClick={() => {
                          onJumpToSlide(item.slideIndex);
                          setActiveTab('current');
                        }}
                        className="text-xs text-[#86868b] hover:text-[#2997ff] flex items-center gap-1 transition font-medium"
                      >
                        Đến slide <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-[#f5f5f7] whitespace-pre-wrap leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
