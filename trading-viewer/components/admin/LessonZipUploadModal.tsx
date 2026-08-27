'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileArchive, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface LessonZipUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LessonZipUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: LessonZipUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    title: string;
    slideCount: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileSelection = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMsg('Vui lòng chỉ tải lên tệp nén định dạng .ZIP.');
      return;
    }
    setSelectedFile(file);
    setErrorMsg(null);
    setSuccessInfo(null);

    // Auto-extract title from file name
    const autoTitle = file.name.replace(/\.zip$/i, '').trim();
    setTitle(autoTitle);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Vui lòng chọn một tệp ZIP.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (title.trim()) formData.append('title', title.trim());
    if (description.trim()) formData.append('description', description.trim());

    try {
      setUploadProgress(50);
      const res = await fetch('/api/admin/lessons/import-zip', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);
      const data = await res.json();

      if (res.ok && data.success) {
        setUploadProgress(100);
        setSuccessInfo({
          title: data.lesson?.title || title,
          slideCount: data.lesson?.slide_count || 0,
        });
        onSuccess();
      } else {
        setErrorMsg(data.message || 'Lỗi nhập tệp ZIP.');
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ trong khi tải lên.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setErrorMsg(null);
    setSuccessInfo(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#161617] border border-white/[0.12] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8 relative">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2997ff]/20 text-[#2997ff] flex items-center justify-center shadow-sm">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f5f5f7] tracking-tight">
                Nhập Bài Học Bằng Tệp ZIP
              </h3>
              <p className="text-xs text-[#86868b]">
                Tự động trích xuất thư mục ảnh và phân loại slide theo thứ tự
              </p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="p-1.5 text-[#86868b] hover:text-[#f5f5f7] rounded-xl hover:bg-white/[0.06] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-2xl flex items-start gap-2.5 text-[#ff453a] text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successInfo ? (
          /* Success Result State */
          <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#30d158]/15 border border-[#30d158]/30 flex items-center justify-center text-[#30d158] mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-[#f5f5f7]">
                Nhập Bài Học Thành Công!
              </h4>
              <p className="text-xs text-[#86868b]">
                Chuyên đề đã được đưa vào cơ sở dữ liệu MySQL và sẵn sàng cho học viên.
              </p>
            </div>

            <div className="p-4 bg-[#1c1c1e] border border-white/[0.08] rounded-2xl text-left space-y-2">
              <div className="text-xs font-semibold text-[#f5f5f7]">
                {successInfo.title}
              </div>
              <div className="flex items-center gap-4 text-xs text-[#86868b]">
                <span className="flex items-center gap-1.5 text-[#2997ff]">
                  <Layers className="w-3.5 h-3.5" />
                  <strong>{successInfo.slideCount}</strong> slides hình ảnh 2K
                </span>
                <span className="text-[#30d158] font-medium">✓ Đã lưu database</span>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl shadow-lg transition"
            >
              Hoàn tất & Đóng
            </button>
          </div>
        ) : (
          /* Upload Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-[#2997ff] bg-[#2997ff]/10'
                  : selectedFile
                  ? 'border-[#30d158]/50 bg-[#30d158]/5'
                  : 'border-white/[0.12] hover:border-white/[0.25] bg-[#1c1c1e]/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,application/zip"
                onChange={(e) => {
                  if (e.target.value && e.target.files?.[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#30d158]/20 text-[#30d158] flex items-center justify-center mx-auto">
                    <FileArchive className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold text-[#f5f5f7] break-all">
                    {selectedFile.name}
                  </div>
                  <div className="text-[11px] text-[#86868b]">
                    Kích thước: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click để đổi tệp khác
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#2997ff]/10 text-[#2997ff] flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-medium text-[#f5f5f7]">
                    Kéo thả tệp <span className="text-[#2997ff]">.ZIP</span> chứa ảnh vào đây hoặc bấm để chọn
                  </div>
                  <div className="text-[11px] text-[#86868b]">
                    Tên file ZIP sẽ được tự động nhận diện làm Tên bài học
                  </div>
                </div>
              )}
            </div>

            {/* Title & Description Inputs */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#a1a1a6] flex items-center justify-between">
                  <span>Tên Bài Học (Tự động nhận diện từ tên tệp ZIP)</span>
                  <span className="text-[10px] text-[#2997ff]">Tự động điền</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="15. Thấu hiểu Orderflow và Delta"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#a1a1a6]">
                  Mô tả / Ghi chú chuyên đề (Tùy chọn)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Nội dung tóm tắt của bài học..."
                  className="w-full px-3.5 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] resize-none"
                />
              </div>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-[#86868b]">
                  <span>Đang giải nén và nạp hình ảnh vào Database...</span>
                  <span className="font-mono text-[#2997ff]">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1c1c1e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2997ff] transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={resetForm}
                disabled={isUploading}
                className="px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#f5f5f7] rounded-xl transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl shadow-lg transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xử lý ZIP...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bắt đầu Import Bài Học</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
