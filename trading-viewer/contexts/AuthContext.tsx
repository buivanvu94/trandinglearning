'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/types/user';

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string; code?: string; status?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string; note?: string }) => Promise<{ success: boolean; message?: string; status?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        return { success: true, message: data.message };
      }

      return {
        success: false,
        message: data.message || 'Đăng nhập thất bại.',
        code: data.code,
        status: data.status,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
      };
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    note?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      return {
        success: res.ok && data.success,
        message: data.message || (res.ok ? 'Đăng ký thành công.' : 'Đăng ký thất bại.'),
        status: data.status,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
      router.push('/login');
    }
  };

  const value = {
    user,
    isLoading,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user && user.status === 'active',
    login,
    register,
    logout,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
