import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Chưa đăng nhập hoặc phiên đã hết hạn.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Auth /me error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi kiểm tra phiên đăng nhập.' },
      { status: 500 }
    );
  }
}
