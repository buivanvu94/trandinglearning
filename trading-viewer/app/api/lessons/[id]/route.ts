import { NextRequest, NextResponse } from 'next/server';
import { getDbLessonById } from '@/lib/db-lessons';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lesson = await getDbLessonById(id);

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy bài học.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error('GET /api/lessons/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi tải bài học.' },
      { status: 500 }
    );
  }
}
