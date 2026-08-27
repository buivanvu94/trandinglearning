import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

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
    const lessonId = parseInt(id, 10);
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { success: false, message: 'ID bài học không hợp lệ.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, order_index } = body;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(String(title).trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description ? String(description).trim() : null);
    }

    if (order_index !== undefined) {
      updates.push('order_index = ?');
      values.push(parseInt(String(order_index), 10));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không có trường nào cần cập nhật.' },
        { status: 400 }
      );
    }

    values.push(lessonId);
    await execute(
      `UPDATE lessons SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return NextResponse.json({
      success: true,
      message: 'Cập nhật bài học thành công.',
    });
  } catch (error) {
    console.error('PATCH /api/admin/lessons/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi cập nhật bài học.' },
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
    const lessonId = parseInt(id, 10);
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ.' },
        { status: 400 }
      );
    }

    await execute('DELETE FROM lessons WHERE id = ?', [lessonId]);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa bài học thành công.',
    });
  } catch (error) {
    console.error('DELETE /api/admin/lessons/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi xóa bài học.' },
      { status: 500 }
    );
  }
}
