import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import sizeOf from 'image-size';
import { execute, query, withTransaction } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedUser(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Quyền truy cập bị từ chối: Yêu cầu quyền Quản trị viên.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customTitle = formData.get('title') as string | null;
    const customDescription = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng chọn tệp ZIP để tải lên.' },
        { status: 400 }
      );
    }

    // Extract filename without .zip
    const originalFileName = file.name || 'Bai_Hoc_Moi.zip';
    const baseName = originalFileName.replace(/\.zip$/i, '').trim();
    const lessonTitle = customTitle?.trim() || baseName;

    // Sanitize folder name for filesystem
    const sanitizedFolderName = lessonTitle
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, ' ')
      .trim();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let zip: AdmZip;
    try {
      zip = new AdmZip(buffer);
    } catch (zipErr) {
      return NextResponse.json(
        { success: false, message: 'Tệp tải lên không phải là định dạng ZIP hợp lệ.' },
        { status: 400 }
      );
    }

    const zipEntries = zip.getEntries();

    // Filter valid image files, ignore OS meta files like __MACOSX, .DS_Store
    const imageEntries = zipEntries.filter((entry) => {
      if (entry.isDirectory) return false;
      if (entry.entryName.includes('__MACOSX') || entry.name.startsWith('.')) return false;
      const ext = path.extname(entry.name).toLowerCase();
      return IMAGE_EXTENSIONS.has(ext);
    });

    if (imageEntries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Không tìm thấy hình ảnh nào trong tệp ZIP. Vui lòng đảm bảo tệp chứa ảnh (.png, .jpg, .jpeg, .webp).',
        },
        { status: 400 }
      );
    }

    // Natural alphanumeric sorting: slide_01, slide_02, ... slide_10
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    imageEntries.sort((a, b) => collator.compare(a.name, b.name));

    // Target folder on server: public/lessons/<sanitizedFolderName>
    const targetDir = path.join(process.cwd(), 'public', 'lessons', sanitizedFolderName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Process and save images
    interface PreparedSlide {
      slideIndex: number;
      filename: string;
      relativePath: string;
      width: number;
      height: number;
      format: string;
      sizeBytes: number;
    }

    const preparedSlides: PreparedSlide[] = [];

    for (let i = 0; i < imageEntries.length; i++) {
      const entry = imageEntries[i];
      const slideIndex = i + 1;
      const ext = path.extname(entry.name).toLowerCase();
      const rawExt = ext.replace('.', '') || 'png';
      
      // Save file with clean name: slide_01.png or original clean name
      const targetFilename = entry.name.replace(/[/\\?%*:|"<>]/g, '_');
      const targetFilePath = path.join(targetDir, targetFilename);

      const fileData = entry.getData();
      fs.writeFileSync(targetFilePath, fileData);

      let width = 2560;
      let height = 1440;
      try {
        const dimensions = sizeOf(fileData);
        if (dimensions.width && dimensions.height) {
          width = dimensions.width;
          height = dimensions.height;
        }
      } catch {
        // Fallback default 2K aspect ratio
      }

      preparedSlides.push({
        slideIndex,
        filename: targetFilename,
        relativePath: `${sanitizedFolderName}/${targetFilename}`,
        width,
        height,
        format: rawExt,
        sizeBytes: fileData.length,
      });
    }

    // Determine next order_index
    const [maxOrderRow] = await query<{ max_order: number | null }[]>(
      'SELECT MAX(order_index) as max_order FROM lessons'
    );
    const nextOrder = (maxOrderRow?.max_order || 0) + 1;

    // Database insertion in transaction
    let newLessonId = 0;
    await withTransaction(async (conn) => {
      const [insertRes] = await conn.execute(
        `INSERT INTO lessons (title, folder_name, slide_count, order_index, description)
         VALUES (?, ?, ?, ?, ?)`,
        [
          lessonTitle,
          sanitizedFolderName,
          preparedSlides.length,
          nextOrder,
          customDescription?.trim() || `Bài giảng nhập từ ZIP: ${originalFileName}`,
        ]
      );

      const header = insertRes as { insertId: number };
      newLessonId = header.insertId;

      for (const s of preparedSlides) {
        await conn.execute(
          `INSERT INTO slides (lesson_id, slide_index, filename, relative_path, width, height, format, size_bytes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newLessonId,
            s.slideIndex,
            s.filename,
            s.relativePath,
            s.width,
            s.height,
            s.format,
            s.sizeBytes,
          ]
        );
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: `Đã nhập thành công bài học "${lessonTitle}" gồm ${preparedSlides.length} hình ảnh slides!`,
        lesson: {
          id: newLessonId,
          title: lessonTitle,
          folder_name: sanitizedFolderName,
          slide_count: preparedSlides.length,
          order_index: nextOrder,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('ZIP Import Error:', error);
    const message = error instanceof Error ? error.message : 'Lỗi xử lý tệp ZIP';
    return NextResponse.json(
      { success: false, message: `Lỗi nhập bài học: ${message}` },
      { status: 500 }
    );
  }
}
