import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { User } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, phone, note } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Địa chỉ email không đúng định dạng.' },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await query<User[]>(
      'SELECT id, email, status FROM users WHERE email = ? LIMIT 1',
      [trimmedEmail]
    );

    if (existingUsers && existingUsers.length > 0) {
      const existing = existingUsers[0];
      if (existing.status === 'pending') {
        return NextResponse.json(
          {
            success: false,
            message: 'Email này đã được đăng ký và đang chờ Admin kích hoạt.',
            status: 'pending',
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Email này đã tồn tại trên hệ thống.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(String(password));

    // Insert new pending user
    const result = await execute(
      `INSERT INTO users (email, name, password_hash, role, status, phone, note)
       VALUES (?, ?, ?, 'user', 'pending', ?, ?)`,
      [
        trimmedEmail,
        trimmedName,
        passwordHash,
        phone ? String(phone).trim() : null,
        note ? String(note).trim() : null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message:
          'Đăng ký tài khoản thành công! Tài khoản của bạn đang ở trạng thái Chờ kích hoạt. Vui lòng liên hệ Admin để được phê duyệt truy cập.',
        userId: result.insertId,
        status: 'pending',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.',
      },
      { status: 500 }
    );
  }
}
