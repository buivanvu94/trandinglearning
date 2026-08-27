import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { query } from './db';
import { JWTPayload, SafeUser, User } from '@/types/user';

export const AUTH_COOKIE_NAME = 'auth_token';

const JWT_SECRET =
  process.env.JWT_SECRET || 'trading_masterclass_pro_fallback_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signJwtToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyJwtToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function sanitizeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    phone: user.phone || null,
    note: user.note || null,
    created_at: user.created_at,
    last_login_at: user.last_login_at || null,
  };
}

export async function getAuthenticatedUser(
  request?: NextRequest
): Promise<SafeUser | null> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  }

  if (!token) return null;

  const payload = verifyJwtToken(token);
  if (!payload) return null;

  try {
    const users = await query<User[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );

    if (!users || users.length === 0) return null;

    const user = users[0];
    if (user.status !== 'active') return null;

    return sanitizeUser(user);
  } catch (err) {
    console.error('getAuthenticatedUser error:', err);
    return null;
  }
}
