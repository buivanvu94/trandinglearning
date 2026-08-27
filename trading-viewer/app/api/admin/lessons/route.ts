import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedUser(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Quyền truy cập bị từ chối.' },
        { status: 403 }
      );
    }

    const lessons = await query<
      {
        id: number;
        title: string;
        folder_name: string;
        slide_count: number;
        order_index: number;
        description: string | null;
        created_at: string;
        first_slide: string | null;
      }[]
    >(`
      SELECT 
        l.*,
        (SELECT relative_path FROM slides s WHERE s.lesson_id = l.id ORDER BY s.slide_index ASC LIMIT 1) as first_slide
      FROM lessons l
      ORDER BY l.order_index ASC, l.id ASC
    `);

    const [stats] = await query<{ totalLessons: number; totalSlides: number }[]>(`
      SELECT 
        COUNT(DISTINCT l.id) as totalLessons,
        COALESCE(SUM(l.slide_count), 0) as totalSlides
      FROM lessons l
    `);

    return NextResponse.json({
      success: true,
      lessons,
      stats: {
        totalLessons: Number(stats?.totalLessons || 0),
        totalSlides: Number(stats?.totalSlides || 0),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/lessons error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi tải danh sách bài học.' },
      { status: 500 }
    );
  }
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
    const { title, folder_name, description } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Tiêu đề bài học không được để trống.' },
        { status: 400 }
      );
    }

    const trimmedTitle = String(title).trim();
    const folder = folder_name?.trim() || trimmedTitle.replace(/[/\\?%*:|"<>]/g, '-');

    const [maxOrder] = await query<{ max_order: number | null }[]>(
      'SELECT MAX(order_index) as max_order FROM lessons'
    );
    const nextOrder = (maxOrder?.max_order || 0) + 1;

    const result = await execute(
      `INSERT INTO lessons (title, folder_name, slide_count, order_index, description)
       VALUES (?, ?, 0, ?, ?)`,
      [trimmedTitle, folder, nextOrder, description?.trim() || null]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Tạo bài học mới thành công.',
        lessonId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/lessons error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi tạo bài học mới.' },
      { status: 500 }
    );
  }
}
