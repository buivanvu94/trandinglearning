'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Plus, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  Shield, 
  RefreshCw,
  Phone,
  FileText,
  AlertCircle
} from 'lucide-react';
import { SafeUser, UserStatus, UserRole } from '@/types/user';
import { UserAddModal } from '@/components/admin/UserAddModal';
import { UserEditModal } from '@/components/admin/UserEditModal';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    rejected: 0,
    admins: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (roleFilter !== 'all') params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Quick 1-Click Status Update (Approve/Reject/Activate)
  const handleQuickStatusChange = async (userId: number, newStatus: UserStatus) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Role Toggle
  const handleQuickRoleToggle = async (userId: number, currentRole: UserRole) => {
    setActionLoadingId(userId);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: number, email: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${email}" không?`)) return;

    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = useMemo(() => users, [users]);

  return (
    <div className="space-y-8">
      {/* Top Banner & KPI Stat Tiles */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f7]">
              Quản Trị Người Dùng & Phê Duyệt
            </h1>
            <p className="text-xs text-[#86868b] mt-1">
              Kiểm duyệt học viên đăng ký mới, phân quyền Admin và quản lý trạng thái tài khoản.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchUsers()}
              className="p-2.5 bg-[#161617] hover:bg-[#1f1f21] border border-white/[0.08] text-[#86868b] hover:text-[#f5f5f7] rounded-xl transition cursor-pointer"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#2997ff]' : ''}`} />
            </button>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Học Viên</span>
            </button>
          </div>
        </div>

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Approval Card */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
            className={`p-5 rounded-2xl border transition cursor-pointer relative overflow-hidden ${
              statusFilter === 'pending'
                ? 'bg-[#ffd60a]/15 border-[#ffd60a]/40 ring-1 ring-[#ffd60a]/40'
                : 'bg-[#161617] border-white/[0.08] hover:border-[#ffd60a]/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#86868b]">Chờ Phê Duyệt</span>
              <div className="w-7 h-7 rounded-xl bg-[#ffd60a]/20 text-[#ffd60a] flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[#ffd60a]">
                {stats.pending}
              </span>
              {stats.pending > 0 && (
                <span className="text-[10px] text-[#ffd60a] font-medium animate-pulse">
                  • Cần duyệt ngay
                </span>
              )}
            </div>
          </div>

          {/* Active Card */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
            className={`p-5 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-[#30d158]/15 border-[#30d158]/40 ring-1 ring-[#30d158]/40'
                : 'bg-[#161617] border-white/[0.08] hover:border-[#30d158]/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#86868b]">Đang Hoạt Động</span>
              <div className="w-7 h-7 rounded-xl bg-[#30d158]/20 text-[#30d158] flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold font-mono text-[#30d158]">
              {stats.active}
            </div>
          </div>

          {/* Rejected Card */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
            className={`p-5 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'rejected'
                ? 'bg-[#ff453a]/15 border-[#ff453a]/40 ring-1 ring-[#ff453a]/40'
                : 'bg-[#161617] border-white/[0.08] hover:border-[#ff453a]/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#86868b]">Đã Khóa / Từ Chối</span>
              <div className="w-7 h-7 rounded-xl bg-[#ff453a]/20 text-[#ff453a] flex items-center justify-center">
                <UserX className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold font-mono text-[#ff453a]">
              {stats.rejected}
            </div>
          </div>

          {/* Total Card */}
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-5 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white/[0.06] border-[#2997ff]/40'
                : 'bg-[#161617] border-white/[0.08] hover:border-white/[0.16]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#86868b]">Tổng Tài Khoản</span>
              <div className="w-7 h-7 rounded-xl bg-white/[0.08] text-[#f5f5f7] flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold font-mono text-[#f5f5f7]">
              {stats.total}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3.5 bg-[#161617] border border-white/[0.08] rounded-2xl">
        <div className="flex flex-wrap items-center bg-[#1c1c1e] p-0.5 rounded-xl border border-white/[0.06] text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
              statusFilter === 'all'
                ? 'bg-[#2c2c2e] text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#f5f5f7]'
            }`}
          >
            Tất cả ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-[#ffd60a] text-black shadow-sm font-semibold'
                : 'text-[#ffd60a] hover:text-[#f5f5f7]'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Chờ duyệt ({stats.pending})</span>
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
              statusFilter === 'active'
                ? 'bg-[#2c2c2e] text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#f5f5f7]'
            }`}
          >
            Hoạt động ({stats.active})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
              statusFilter === 'rejected'
                ? 'bg-[#2c2c2e] text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#f5f5f7]'
            }`}
          >
            Đã khóa ({stats.rejected})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT, ghi chú..."
            className="w-full pl-9 pr-4 py-2 bg-[#1c1c1e] border border-white/[0.08] rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#161617] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1c1c1e]/60 border-b border-white/[0.06] text-[#86868b] uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-6 py-4">Học Viên / Người Dùng</th>
                <th className="px-4 py-4">Vai Trò</th>
                <th className="px-4 py-4">Trạng Thái</th>
                <th className="px-4 py-4">Ngày Đăng Ký</th>
                <th className="px-6 py-4 text-right">Thao Tác Nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#86868b]">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#2997ff]/30 border-t-[#2997ff] rounded-full animate-spin" />
                        <span>Đang tải dữ liệu người dùng...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Users className="w-8 h-8 mx-auto text-[#86868b]/50" />
                        <p>Không tìm thấy tài khoản nào khớp với bộ lọc.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isPending = u.status === 'pending';
                  const isActive = u.status === 'active';
                  const isRejected = u.status === 'rejected';
                  const isActionLoading = actionLoadingId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-white/[0.02] transition ${
                        isPending ? 'bg-[#ffd60a]/[0.03]' : ''
                      }`}
                    >
                      {/* Name, Email, Phone, Note */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isPending
                                ? 'bg-[#ffd60a]/20 text-[#ffd60a] border border-[#ffd60a]/30'
                                : isActive
                                ? 'bg-[#30d158]/20 text-[#30d158] border border-[#30d158]/30'
                                : 'bg-[#ff453a]/20 text-[#ff453a] border border-[#ff453a]/30'
                            }`}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#f5f5f7] truncate">
                                {u.name}
                              </span>
                              {u.phone && (
                                <span className="text-[10px] text-[#86868b] bg-white/[0.04] px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5" />
                                  {u.phone}
                                </span>
                              )}
                            </div>
                            <div className="text-[#86868b] text-[11px] font-mono truncate">
                              {u.email}
                            </div>
                            {u.note && (
                              <div className="text-[10px] text-[#2997ff] flex items-center gap-1 italic mt-0.5">
                                <FileText className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate max-w-xs">{u.note}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleQuickRoleToggle(u.id, u.role)}
                          title="Click để đổi vai trò"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                            u.role === 'admin'
                              ? 'bg-[#2997ff]/15 text-[#2997ff] border border-[#2997ff]/30 hover:bg-[#2997ff]/25'
                              : 'bg-white/[0.06] text-[#86868b] border border-white/[0.08] hover:text-[#f5f5f7]'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{u.role === 'admin' ? 'Quản Trị Viên' : 'Học Viên'}</span>
                        </button>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/30 rounded-full text-[11px] font-semibold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ffd60a]" />
                            Chờ Kích Hoạt
                          </span>
                        )}
                        {isActive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30 rounded-full text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
                            Đang Hoạt Động
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ff453a]/15 text-[#ff453a] border border-[#ff453a]/30 rounded-full text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff453a]" />
                            Đã Khóa / Từ Chối
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-[#86868b] text-[11px] font-mono">
                        <div>
                          {new Date(u.created_at).toLocaleDateString('vi-VN')}
                        </div>
                        {u.last_login_at ? (
                          <div className="text-[10px] text-[#86868b]/70">
                            Login: {new Date(u.last_login_at).toLocaleDateString('vi-VN')}
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#86868b]/40">
                            Chưa đăng nhập
                          </div>
                        )}
                      </td>

                      {/* Quick Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1-Click Approve / Activate */}
                          {isPending && (
                            <button
                              onClick={() => handleQuickStatusChange(u.id, 'active')}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 bg-[#30d158] hover:bg-[#30d158]/90 text-black text-xs font-bold rounded-xl shadow transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Kích hoạt ngay</span>
                            </button>
                          )}

                          {/* Reject / Lock */}
                          {isPending && (
                            <button
                              onClick={() => handleQuickStatusChange(u.id, 'rejected')}
                              disabled={isActionLoading}
                              title="Từ chối yêu cầu đăng ký"
                              className="p-1.5 text-[#ff453a] hover:bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-xl transition cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          {/* Active User Toggle Lock */}
                          {isActive && (
                            <button
                              onClick={() => handleQuickStatusChange(u.id, 'rejected')}
                              disabled={isActionLoading}
                              title="Tạm khóa tài khoản này"
                              className="px-2.5 py-1 text-[11px] text-[#86868b] hover:text-[#ff453a] hover:bg-[#ff453a]/10 border border-white/[0.08] hover:border-[#ff453a]/20 rounded-xl transition cursor-pointer"
                            >
                              Khóa
                            </button>
                          )}

                          {/* Rejected User Re-activate */}
                          {isRejected && (
                            <button
                              onClick={() => handleQuickStatusChange(u.id, 'active')}
                              disabled={isActionLoading}
                              title="Mở khóa tài khoản"
                              className="px-2.5 py-1 text-[11px] text-[#30d158] hover:bg-[#30d158]/10 border border-[#30d158]/20 rounded-xl transition cursor-pointer"
                            >
                              Mở khóa
                            </button>
                          )}

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setIsEditOpen(true);
                            }}
                            title="Chỉnh sửa thông tin"
                            className="p-1.5 text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.06] rounded-xl transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={isActionLoading}
                            title="Xóa người dùng"
                            className="p-1.5 text-[#86868b] hover:text-[#ff453a] hover:bg-[#ff453a]/10 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <UserAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => fetchUsers()}
      />

      <UserEditModal
        user={selectedUser}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => fetchUsers()}
      />
    </div>
  );
}
