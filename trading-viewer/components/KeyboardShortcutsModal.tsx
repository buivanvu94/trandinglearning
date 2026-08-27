'use client';

import React from 'react';
import { X, Keyboard, Zap } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '→ / Space', desc: 'Chuyển sang Slide kế tiếp' },
    { key: '←', desc: 'Quay lại Slide trước đó' },
    { key: 'Z', desc: 'Bật / Tắt chế độ Zoom Inspector 2K' },
    { key: 'N', desc: 'Mở sổ tay Ghi chú cho slide hiện tại' },
    { key: 'B', desc: 'Đánh dấu (Bookmark) / Bỏ đánh dấu slide' },
    { key: 'F', desc: 'Bật / Tắt chế độ Toàn màn hình (Fullscreen)' },
    { key: '1', desc: 'Chuyển sang chế độ Slide Player' },
    { key: '2', desc: 'Chuyển sang chế độ Continuous Scroll Storyboard' },
    { key: '3', desc: 'Chuyển sang chế độ Grid Overview' },
    { key: 'Esc', desc: 'Đóng Modal / Thoát chế độ Zoom hoặc Fullscreen' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#161617] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/[0.08] text-[#2997ff] border border-white/[0.06] rounded-xl">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#f5f5f7]">Phím tắt thao tác nhanh</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#86868b] hover:text-white hover:bg-white/[0.08] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-[#1c1c1e] border border-white/[0.06]"
            >
              <span className="text-xs text-[#f5f5f7] font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-medium text-[#2997ff] bg-white/[0.08] border border-white/[0.08] rounded-lg shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-black/40 border-t border-white/[0.08] text-center">
          <p className="text-xs text-[#86868b] flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#ffd60a]" />
            Mẹo: Bạn cũng có thể click vào nửa trái/phải màn hình để lùi/tiến slide
          </p>
        </div>
      </div>
    </div>
  );
}
