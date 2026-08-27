'use client';

import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, User as UserIcon, Phone, FileText } from 'lucide-react';
import { UserRole, UserStatus } from '@/types/user';

interface UserAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserAddModal({ isOpen, onClose, onSuccess }: UserAddModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [status, setStatus] = useState<UserStatus>('active');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Vui lòng điền đủ họ tên, email và mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          status,
          phone: phone.trim() || undefined,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.message || 'Lỗi tạo người dùng.');
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161617] border border-white/[0.12] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-6 p-6 sm:p-7 relative">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2997ff]/20 text-[#2997ff] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#f5f5f7]">
              Thêm Học Viên / Quản Trị Viên
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#86868b] hover:text-[#f5f5f7] rounded-lg hover:bg-white/[0.06] transition"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#a1a1a6]">Họ và Tên *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="w-full px-3.5 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#a1a1a6]">Email Đăng Nhập *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com"
                required
                className="w-full px-3.5 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#a1a1a6]">Mật khẩu Khởi Tạo *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#a1a1a6]">Vai trò (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]"
              >
                <option value="user">Học viên (User)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#a1a1a6]">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-3.5 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]"
              >
                <option value="active">Kích hoạt ngay (Active)</option>
                <option value="pending">Chờ kích hoạt (Pending)</option>
                <option value="rejected">Tạm khóa (Rejected)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#a1a1a6]">Số điện thoại / Zalo</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className="w-full px-3.5 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#a1a1a6]">Ghi chú nội bộ</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ghi chú về học viên, nguồn đăng ký..."
              className="w-full px-3.5 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] resize-none"
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
              className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? 'Đang tạo...' : 'Lưu người dùng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
