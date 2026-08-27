'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  BarChart2, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setPendingNotice(null);

    const res = await login(email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      router.push(redirect);
    } else {
      if (res.code === 'ACCOUNT_PENDING' || res.status === 'pending') {
        setPendingNotice(res.message || 'Tài khoản của bạn đang chờ Admin kích hoạt.');
      } else {
        setErrorMsg(res.message || 'Đăng nhập thất bại.');
      }
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@tradingpro.com');
    setPassword('Admin@123456');
    setErrorMsg(null);
    setPendingNotice(null);
  };

  return (
    <div className="w-full max-w-[440px] space-y-6">
      {/* Card Container */}
      <div className="bg-[#161617] border border-white/[0.08] rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#2997ff]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Text */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.06] border border-white/[0.08] rounded-full text-[11px] font-medium text-[#2997ff]">
            <ShieldCheck className="w-3.5 h-3.5" /> Hệ Thống Quản Trị & Học Tập
          </div>
          <h1 className="text-2xl font-bold text-[#f5f5f7] tracking-tight">
            Đăng Nhập
          </h1>
          <p className="text-xs text-[#86868b]">
            Nhập thông tin tài khoản đã được phê duyệt để tiếp tục
          </p>
        </div>

        {/* Pending Notice Banner (Critical RBAC Feature) */}
        {pendingNotice && (
          <div className="p-4 bg-[#ffd60a]/10 border border-[#ffd60a]/20 rounded-2xl space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-[#ffd60a] text-xs font-semibold">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Tài khoản Đang Chờ Kích Hoạt</span>
            </div>
            <p className="text-[11px] text-[#a1a1a6] leading-relaxed">
              {pendingNotice}
            </p>
            <div className="text-[10px] text-[#86868b] pt-1 border-t border-[#ffd60a]/10 flex items-center justify-between">
              <span>Trạng thái: <strong>Pending Approval</strong></span>
              <span className="text-[#ffd60a]">Liên hệ Admin</span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-2xl flex items-start gap-2.5 text-[#ff453a] text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#a1a1a6] block">
              Địa chỉ Email
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#a1a1a6] block">
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] focus:ring-1 focus:ring-[#2997ff] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0062c4] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Đăng nhập hệ thống</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pill */}
        <div className="pt-2 border-t border-white/[0.06] text-center">
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#86868b] hover:text-[#2997ff] transition px-3 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#2997ff]" />
            <span>Thử nhanh bằng tài khoản <strong>Admin mặc định</strong></span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-[#86868b]">
        Quy trình bảo mật: Chỉ tài khoản được Admin kích hoạt mới có quyền truy cập.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col justify-between selection:bg-[#2997ff]/30 font-sans">
      {/* Top Subtle Nav Header */}
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
          href="/register"
          className="text-xs font-medium text-[#86868b] hover:text-[#f5f5f7] transition flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] hover:border-white/[0.16] bg-white/[0.02]"
        >
          <span>Chưa có tài khoản?</span>
          <span className="text-[#2997ff] font-semibold">Đăng ký ngay</span>
        </Link>
      </header>

      {/* Main Login Card with Suspense */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12 text-xs text-[#86868b]">
              Đang tải biểu mẫu đăng nhập...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
