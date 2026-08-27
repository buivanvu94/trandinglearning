import { NextResponse } from 'next/server';
import { getAllDbLessons } from '@/lib/db-lessons';

export async function GET() {
  try {
    const lessons = await getAllDbLessons();
    return NextResponse.json({
      success: true,
      lessons,
      total: lessons.length,
    });
  } catch (error) {
    console.error('GET /api/lessons error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi tải danh sách bài học.' },
      { status: 500 }
    );
  }
}
