export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'active' | 'rejected';

export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  phone?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

export interface SafeUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string | null;
  note?: string | null;
  created_at: string;
  last_login_at?: string | null;
}

export interface JWTPayload {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  iat?: number;
  exp?: number;
}
