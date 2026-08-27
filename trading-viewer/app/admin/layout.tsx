'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  FolderArchive, 
  BarChart2, 
  ArrowLeft, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users?status=pending');
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.stats?.pending || 0);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/login?redirect=' + pathname);
    } else if (isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin, isLoading, router, pathname, fetchStats]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-[#86868b]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#2997ff]/30 border-t-[#2997ff] rounded-full animate-spin" />
          <span className="text-xs">Đang xác thực quyền Quản trị...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: '/admin/users',
      label: 'Quản lý Học viên',
      icon: Users,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-[#ffd60a] text-black font-bold',
    },
    {
      href: '/admin/lessons',
      label: 'Quản lý Bài học & ZIP',
      icon: FolderArchive,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col selection:bg-[#2997ff]/30 font-sans">
      {/* Top Pro Header */}
      <header className="border-b border-white/[0.08] bg-[#161617]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-[#2997ff] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold tracking-tight text-[#f5f5f7] hidden sm:inline">
                Trading Masterclass
              </span>
            </Link>

            <ChevronRight className="w-3.5 h-3.5 text-[#86868b]" />

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded-full text-[11px] font-semibold text-[#2997ff]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </div>
          </div>

          {/* User Profile & Quick Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#86868b] hover:text-[#f5f5f7] bg-[#1c1c1e] hover:bg-[#252527] border border-white/[0.06] rounded-full transition"
            >
              <ExternalLink className="w-3 h-3 text-[#2997ff]" />
              <span className="hidden sm:inline">Xem Giao diện Học viên</span>
            </Link>

            <div className="h-4 w-[1px] bg-white/[0.10]" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#2997ff]/20 border border-[#2997ff]/40 flex items-center justify-center text-[11px] font-bold text-[#2997ff]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-[#f5f5f7] leading-none">
                  {user.name}
                </div>
                <div className="text-[10px] text-[#2997ff] font-mono leading-none mt-0.5">
                  Super Admin
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-2 text-[#86868b] hover:text-[#ff453a] hover:bg-[#ff453a]/10 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 -mb-[1px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition relative ${
                  isActive
                    ? 'border-[#2997ff] text-[#f5f5f7] bg-white/[0.02]'
                    : 'border-transparent text-[#86868b] hover:text-[#f5f5f7] hover:border-white/[0.15]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2997ff]' : ''}`} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Admin Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
