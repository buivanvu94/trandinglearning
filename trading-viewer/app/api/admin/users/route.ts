import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getAuthenticatedUser, hashPassword, sanitizeUser } from '@/lib/auth';
import { User, SafeUser } from '@/types/user';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedUser(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Quyền truy cập bị từ chối.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || 'all';
    const role = searchParams.get('role')?.trim() || 'all';

    let sql = 'SELECT * FROM users WHERE 1=1';
    const params: unknown[] = [];

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR note LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (role !== 'all') {
      sql += ' AND role = ?';
      params.push(role);
    }

    sql += ' ORDER BY CASE WHEN status = "pending" THEN 1 ELSE 2 END, created_at DESC';

    const users = await query<User[]>(sql, params);
    const safeUsers: SafeUser[] = users.map(sanitizeUser);

    // Compute stats
    const [statsRows] = await query<{
      total: number;
      pending: number;
      active: number;
      rejected: number;
      admins: number;
    }[]>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins
      FROM users
    `);

    return NextResponse.json({
      success: true,
      users: safeUsers,
      stats: {
        total: Number(statsRows?.total || 0),
        pending: Number(statsRows?.pending || 0),
        active: Number(statsRows?.active || 0),
        rejected: Number(statsRows?.rejected || 0),
        admins: Number(statsRows?.admins || 0),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi tải danh sách người dùng.' },
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
    const { email, name, password, role = 'user', status = 'active', phone, note } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ email, họ tên và mật khẩu.' },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();

    // Check duplicate email
    const existing = await query<User[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [trimmedEmail]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email này đã tồn tại trên hệ thống.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(String(password));

    const result = await execute(
      `INSERT INTO users (email, name, password_hash, role, status, phone, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        trimmedEmail,
        trimmedName,
        passwordHash,
        role === 'admin' ? 'admin' : 'user',
        ['active', 'pending', 'rejected'].includes(status) ? status : 'active',
        phone ? String(phone).trim() : null,
        note ? String(note).trim() : null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Tạo tài khoản thành công.',
        userId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi tạo người dùng mới.' },
      { status: 500 }
    );
  }
}
