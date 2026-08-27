import { NextRequest, NextResponse } from 'next/server';
import { execute, withTransaction } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

interface ReorderItem {
  id: number;
  order_index: number;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedUser(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Quyền truy cập bị từ chối.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { items } = body as { items: ReorderItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Dữ liệu sắp xếp không hợp lệ.' },
        { status: 400 }
      );
    }

    await withTransaction(async (conn) => {
      for (const item of items) {
        await conn.execute(
          'UPDATE lessons SET order_index = ? WHERE id = ?',
          [item.order_index, item.id]
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thứ tự bài học thành công.',
    });
  } catch (error) {
    console.error('POST /api/admin/lessons/reorder error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi cập nhật thứ tự bài học.' },
      { status: 500 }
    );
  }
}
