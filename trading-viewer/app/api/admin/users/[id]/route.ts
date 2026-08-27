import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getAuthenticatedUser, hashPassword, sanitizeUser } from '@/lib/auth';
import { User } from '@/types/user';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedUser(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Quyền truy cập bị từ chối.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const targetUserId = parseInt(id, 10);
    if (isNaN(targetUserId)) {
      return NextResponse.json(
        { success: false, message: 'ID người dùng không hợp lệ.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, role, name, phone, note, password } = body;

    const existingUsers = await query<User[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [targetUserId]
    );

    if (!existingUsers || existingUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng.' },
        { status: 404 }
      );
    }

    const currentUser = existingUsers[0];

    // Prevent changing own role away from admin to avoid lockout
    if (admin.id === targetUserId && role && role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Bạn không thể tự hạ quyền Admin của chính mình.' },
        { status: 400 }
      );
    }

    // Prevent deactivating own account
    if (admin.id === targetUserId && status && status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Bạn không thể tự khóa tài khoản của chính mình.' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (status && ['pending', 'active', 'rejected'].includes(status)) {
      updates.push('status = ?');
      values.push(status);
    }

    if (role && ['admin', 'user'].includes(role)) {
      updates.push('role = ?');
      values.push(role);
    }

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(String(name).trim());
    }

    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone ? String(phone).trim() : null);
    }

    if (note !== undefined) {
      updates.push('note = ?');
      values.push(note ? String(note).trim() : null);
    }

    if (password) {
      const passHash = await hashPassword(String(password));
      updates.push('password_hash = ?');
      values.push(passHash);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không có thông tin nào được cập nhật.' },
        { status: 400 }
      );
    }

    values.push(targetUserId);
    await execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedUserList = await query<User[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [targetUserId]
    );

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công.',
      user: sanitizeUser(updatedUserList[0]),
    });
  } catch (error) {
    console.error('PATCH /api/admin/users/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi cập nhật người dùng.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedUser(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Quyền truy cập bị từ chối.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const targetUserId = parseInt(id, 10);
    if (isNaN(targetUserId)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ.' },
        { status: 400 }
      );
    }

    if (admin.id === targetUserId) {
      return NextResponse.json(
        { success: false, message: 'Không thể xóa tài khoản của chính bạn.' },
        { status: 400 }
      );
    }

    await execute('DELETE FROM users WHERE id = ?', [targetUserId]);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa người dùng thành công.',
    });
  } catch (error) {
    console.error('DELETE /api/admin/users/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi xóa người dùng.' },
      { status: 500 }
    );
  }
}
