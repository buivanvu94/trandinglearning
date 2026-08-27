import bcrypt from 'bcryptjs';
import { query, execute } from './db';
import existingLessonsData from '@/data/lessons.json';

export async function initDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Create Users Table
    await execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) NOT NULL UNIQUE,
        name VARCHAR(191) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        status ENUM('pending', 'active', 'rejected') NOT NULL DEFAULT 'pending',
        phone VARCHAR(50) NULL,
        note TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP NULL,
        INDEX idx_users_role (role),
        INDEX idx_users_status (status),
        INDEX idx_users_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Create Lessons Table
    await execute(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        folder_name VARCHAR(255) NOT NULL,
        slide_count INT NOT NULL DEFAULT 0,
        order_index INT NOT NULL DEFAULT 0,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_lessons_order (order_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Create Slides Table
    await execute(`
      CREATE TABLE IF NOT EXISTS slides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        slide_index INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        relative_path VARCHAR(500) NOT NULL,
        width INT NOT NULL DEFAULT 0,
        height INT NOT NULL DEFAULT 0,
        format VARCHAR(20) NOT NULL DEFAULT 'png',
        size_bytes BIGINT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        UNIQUE KEY unique_lesson_slide (lesson_id, slide_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create User Progress Table
    await execute(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        lesson_id INT NOT NULL,
        completed_slides JSON NULL,
        last_slide INT NOT NULL DEFAULT 1,
        is_completed TINYINT(1) NOT NULL DEFAULT 0,
        last_viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_lesson_progress (user_id, lesson_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create User Bookmarks Table
    await execute(`
      CREATE TABLE IF NOT EXISTS user_bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        lesson_id INT NOT NULL,
        slide_index INT NOT NULL,
        note TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_bookmark (user_id, lesson_id, slide_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Create User Notes Table
    await execute(`
      CREATE TABLE IF NOT EXISTS user_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        lesson_id INT NOT NULL,
        slide_index INT NOT NULL,
        content TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_note (user_id, lesson_id, slide_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default Admin if no admin exists
    await seedDefaultAdmin();

    // Seed existing lessons from JSON if database is empty
    await seedExistingLessons();

    return { success: true, message: 'Database schema & initial data initialized successfully.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database init error';
    console.error('initDatabase failed:', error);
    return { success: false, message };
  }
}

async function seedDefaultAdmin(): Promise<void> {
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@tradingpro.com';
  const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_DEFAULT_NAME || 'Quản Trị Viên';

  const rows = await query<{ count: number }[]>(
    'SELECT COUNT(*) as count FROM users WHERE role = "admin"'
  );

  if (!rows[0] || rows[0].count === 0) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPass, salt);

    await execute(
      `INSERT INTO users (email, name, password_hash, role, status, note)
       VALUES (?, ?, ?, 'admin', 'active', 'Hệ thống khởi tạo tự động')
       ON DUPLICATE KEY UPDATE role = 'admin', status = 'active'`,
      [adminEmail, adminName, passwordHash]
    );
    console.log(`[SEED] Created default admin: ${adminEmail}`);
  }
}

interface RawSlide {
  slide_index: number;
  filename: string;
  relative_path: string;
  width: number;
  height: number;
  format: string;
  size_bytes: number;
}

interface RawLesson {
  id: number;
  title: string;
  folder_name: string;
  slide_count: number;
  slides: RawSlide[];
}

async function seedExistingLessons(): Promise<void> {
  const rows = await query<{ count: number }[]>(
    'SELECT COUNT(*) as count FROM lessons'
  );

  if (!rows[0] || rows[0].count === 0) {
    const lessons = existingLessonsData as RawLesson[];
    console.log(`[SEED] Seeding ${lessons.length} lessons from JSON data...`);

    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      const lessonResult = await execute(
        `INSERT INTO lessons (id, title, folder_name, slide_count, order_index, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [l.id, l.title, l.folder_name, l.slide_count, i + 1, `Nội dung chuyên đề: ${l.title}`]
      );

      const insertedLessonId = l.id || lessonResult.insertId;

      for (const s of l.slides) {
        await execute(
          `INSERT INTO slides (lesson_id, slide_index, filename, relative_path, width, height, format, size_bytes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            insertedLessonId,
            s.slide_index,
            s.filename,
            s.relative_path,
            s.width || 2560,
            s.height || 1440,
            s.format || 'png',
            s.size_bytes || 0,
          ]
        );
      }
    }
    console.log('[SEED] Lessons and slides seeded successfully!');
  }
}
