import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import {
  comparePassword,
  signJwtToken,
  sanitizeUser,
  AUTH_COOKIE_NAME,
} from '@/lib/auth';
import { User } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập email và mật khẩu.' },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // Query user by email
    const users = await query<User[]>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [trimmedEmail]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isMatch = await comparePassword(String(password), user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    // Check user activation status (CRITICAL BUSINESS REQUIREMENT)
    if (user.status === 'pending') {
      return NextResponse.json(
        {
          success: false,
          code: 'ACCOUNT_PENDING',
          message:
            'Tài khoản của bạn đang chờ Quản trị viên kích hoạt. Vui lòng liên hệ Admin để được cấp quyền vào hệ thống.',
          status: 'pending',
        },
        { status: 403 }
      );
    }

    if (user.status === 'rejected') {
      return NextResponse.json(
        {
          success: false,
          code: 'ACCOUNT_REJECTED',
          message:
            'Tài khoản của bạn đã bị từ chối hoặc vô hiệu hóa bởi Quản trị viên.',
          status: 'rejected',
        },
        { status: 403 }
      );
    }

    // Update last login timestamp
    await execute(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = signJwtToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    });

    const safeUser = sanitizeUser(user);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Đăng nhập thành công.',
        user: safeUser,
        token,
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Đã có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.',
      },
      { status: 500 }
    );
  }
}
