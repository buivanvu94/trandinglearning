import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'root';
  const database = process.env.DB_NAME || 'trading_db';

  console.log(`Connecting to MySQL on ${host}:${port} as ${user}...`);
  const conn = await mysql.createConnection({ host, port, user, password });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`Ensured database "${database}" exists.`);
  await conn.query(`USE \`${database}\``);

  // 1. Users Table
  await conn.query(`
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
  console.log('✓ users table ready');

  // 2. Lessons Table
  await conn.query(`
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
  console.log('✓ lessons table ready');

  // 3. Slides Table
  await conn.query(`
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
  console.log('✓ slides table ready');

  // 4. User Progress Table
  await conn.query(`
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
  console.log('✓ user_progress table ready');

  // 5. User Bookmarks Table
  await conn.query(`
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
  console.log('✓ user_bookmarks table ready');

  // 6. User Notes Table
  await conn.query(`
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
  console.log('✓ user_notes table ready');

  // Seed default admin
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@tradingpro.com';
  const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_DEFAULT_NAME || 'Quản Trị Viên';

  const [adminRows] = await conn.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
  if (adminRows[0].count === 0) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPass, salt);
    await conn.query(
      `INSERT INTO users (email, name, password_hash, role, status, note)
       VALUES (?, ?, ?, 'admin', 'active', 'Hệ thống khởi tạo tự động')
       ON DUPLICATE KEY UPDATE role = 'admin', status = 'active'`,
      [adminEmail, adminName, passwordHash]
    );
    console.log(`✓ Seeded default admin: ${adminEmail} (Pass: ${adminPass})`);
  } else {
    console.log('✓ Admin user already exists');
  }

  // Seed lessons from data/lessons.json
  const [lessonRows] = await conn.query('SELECT COUNT(*) as count FROM lessons');
  if (lessonRows[0].count === 0) {
    const lessonsJsonPath = path.join(__dirname, '../data/lessons.json');
    if (fs.existsSync(lessonsJsonPath)) {
      const lessons = JSON.parse(fs.readFileSync(lessonsJsonPath, 'utf8'));
      console.log(`Seeding ${lessons.length} lessons from lessons.json...`);
      for (let i = 0; i < lessons.length; i++) {
        const l = lessons[i];
        const [res] = await conn.query(
          `INSERT INTO lessons (id, title, folder_name, slide_count, order_index, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [l.id, l.title, l.folder_name, l.slide_count, i + 1, `Chuyên đề ${l.id}: ${l.title}`]
        );
        for (const s of l.slides) {
          await conn.query(
            `INSERT INTO slides (lesson_id, slide_index, filename, relative_path, width, height, format, size_bytes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              l.id,
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
      console.log(`✓ Seeded ${lessons.length} lessons into database!`);
    }
  } else {
    console.log(`✓ Database already has ${lessonRows[0].count} lessons`);
  }

  await conn.end();
  console.log('🎉 Database initialization completed successfully!');
}

run().catch((err) => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
