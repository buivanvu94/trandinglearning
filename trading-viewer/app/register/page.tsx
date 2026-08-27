'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart2, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  FileText, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Vui lòng điền họ tên, email và mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim() || undefined,
      note: note.trim() || undefined,
    });

    setIsLoading(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setErrorMsg(res.message || 'Đăng ký không thành công.');
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col justify-between selection:bg-[#2997ff]/30 font-sans">
      {/* Navigation Header */}
      <header className="px-6 py-6 flex items-center justify-between border-b border-white/[0.06] bg-[#161617]/50 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-[#2997ff] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#2997ff]">
              Trading Masterclass Pro
            </div>
            <div className="text-xs font-medium text-[#86868b]">
              Price Action & Cung Cầu
            </div>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs font-medium text-[#86868b] hover:text-[#f5f5f7] transition flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] hover:border-white/[0.16] bg-white/[0.02]"
        >
          <span>Đã có tài khoản?</span>
          <span className="text-[#2997ff] font-semibold">Đăng nhập</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-10">
        <div className="w-full max-w-[480px] space-y-6">
          {/* Card Container */}
          <div className="bg-[#161617] border border-white/[0.08] rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#2997ff]/10 rounded-full blur-3xl pointer-events-none" />

            {isSuccess ? (
              /* Success State with Pending Approval Callout */
              <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300 py-4">
                <div className="w-16 h-16 rounded-3xl bg-[#30d158]/10 border border-[#30d158]/20 flex items-center justify-center text-[#30d158] mx-auto shadow-xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#f5f5f7] tracking-tight">
                    Đăng Ký Thành Công!
                  </h2>
                  <p className="text-xs text-[#a1a1a6] max-w-sm mx-auto leading-relaxed">
                    Hồ sơ của bạn đã được ghi nhận. Hệ thống áp dụng chính sách xét duyệt tài khoản trước khi cấp quyền học tập.
                  </p>
                </div>

                {/* Status Box */}
                <div className="p-4 bg-[#ffd60a]/10 border border-[#ffd60a]/20 rounded-2xl text-left space-y-2">
                  <div className="flex items-center gap-2 text-[#ffd60a] text-xs font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>Trạng thái: Đang Chờ Admin Kích Hoạt</span>
                  </div>
                  <p className="text-[11px] text-[#86868b] leading-relaxed">
                    Vui lòng liên hệ với Quản trị viên (hoặc Telegram/Zalo hỗ trợ) để được kích hoạt tài khoản <strong>{email}</strong>.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl shadow-lg transition"
                  >
                    <span>Đến Trang Đăng Nhập</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <>
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.06] border border-white/[0.08] rounded-full text-[11px] font-medium text-[#2997ff]">
                    <ShieldAlert className="w-3.5 h-3.5" /> Yêu Cầu Phê Duyệt Kích Hoạt
                  </div>
                  <h1 className="text-2xl font-bold text-[#f5f5f7] tracking-tight">
                    Đăng Ký Học Viên
                  </h1>
                  <p className="text-xs text-[#86868b]">
                    Tạo tài khoản để tham gia khóa học phân tích kỹ thuật 2K
                  </p>
                </div>

                {/* Approval notice */}
                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-start gap-2.5 text-xs text-[#86868b]">
                  <Clock className="w-4 h-4 text-[#ffd60a] shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    <strong>Lưu ý:</strong> Sau khi đăng ký, tài khoản cần được Admin duyệt và kích hoạt mới có thể truy cập bài giảng.
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3.5 bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-2xl flex items-start gap-2.5 text-[#ff453a] text-xs animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#a1a1a6] block">
                      Họ và Tên <span className="text-[#ff453a]">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] focus:ring-1 focus:ring-[#2997ff] transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#a1a1a6] block">
                      Địa chỉ Email <span className="text-[#ff453a]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] focus:ring-1 focus:ring-[#2997ff] transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#a1a1a6] block">
                        Mật khẩu <span className="text-[#ff453a]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 ký tự"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] focus:ring-1 focus:ring-[#2997ff] transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#a1a1a6] block">
                        Xác nhận <span className="text-[#ff453a]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Nhập lại"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] focus:ring-1 focus:ring-[#2997ff] transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#a1a1a6] block">
                      Số điện thoại / Zalo (Tùy chọn)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] focus:ring-1 focus:ring-[#2997ff] transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#a1a1a6] block">
                      Ghi chú / Lời nhắn cho Admin (Tùy chọn)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3" />
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        placeholder="Ví dụ: Học viên K12, đăng ký nhóm Telegram..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] focus:ring-1 focus:ring-[#2997ff] transition resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 mt-2 bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0062c4] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Gửi Đăng Ký Tài Khoản</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
