import { query, execute, withTransaction } from './db';
import { Lesson, Slide } from '@/types/lesson';
import existingLessonsData from '@/data/lessons.json';

interface DbLessonRow {
  id: number;
  title: string;
  folder_name: string;
  slide_count: number;
  order_index: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface DbSlideRow {
  id: number;
  lesson_id: number;
  slide_index: number;
  filename: string;
  relative_path: string;
  width: number;
  height: number;
  format: string;
  size_bytes: number;
}

export async function getAllDbLessons(): Promise<Lesson[]> {
  try {
    const lessonRows = await query<DbLessonRow[]>(
      'SELECT * FROM lessons ORDER BY order_index ASC, id ASC'
    );

    if (!lessonRows || lessonRows.length === 0) {
      return existingLessonsData as Lesson[];
    }

    const slideRows = await query<DbSlideRow[]>(
      'SELECT * FROM slides ORDER BY lesson_id ASC, slide_index ASC'
    );

    const slidesByLesson = new Map<number, Slide[]>();
    for (const s of slideRows) {
      const list = slidesByLesson.get(s.lesson_id) || [];
      list.push({
        slide_index: s.slide_index,
        filename: s.filename,
        relative_path: s.relative_path,
        width: s.width,
        height: s.height,
        format: s.format,
        size_bytes: s.size_bytes,
      });
      slidesByLesson.set(s.lesson_id, list);
    }

    return lessonRows.map((l) => ({
      id: l.id,
      title: l.title,
      folder_name: l.folder_name,
      slide_count: l.slide_count,
      slides: slidesByLesson.get(l.id) || [],
    }));
  } catch (error) {
    console.error('getAllDbLessons error:', error);
    return existingLessonsData as Lesson[];
  }
}

export async function getDbLessonById(id: number | string): Promise<Lesson | undefined> {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numericId)) return undefined;

  try {
    const lessonRows = await query<DbLessonRow[]>(
      'SELECT * FROM lessons WHERE id = ? LIMIT 1',
      [numericId]
    );

    if (!lessonRows || lessonRows.length === 0) {
      return (existingLessonsData as Lesson[]).find((l) => l.id === numericId);
    }

    const l = lessonRows[0];
    const slideRows = await query<DbSlideRow[]>(
      'SELECT * FROM slides WHERE lesson_id = ? ORDER BY slide_index ASC',
      [numericId]
    );

    return {
      id: l.id,
      title: l.title,
      folder_name: l.folder_name,
      slide_count: l.slide_count,
      slides: slideRows.map((s) => ({
        slide_index: s.slide_index,
        filename: s.filename,
        relative_path: s.relative_path,
        width: s.width,
        height: s.height,
        format: s.format,
        size_bytes: s.size_bytes,
      })),
    };
  } catch (error) {
    console.error('getDbLessonById error:', error);
    return (existingLessonsData as Lesson[]).find((l) => l.id === numericId);
  }
}

export async function deleteDbLesson(id: number): Promise<boolean> {
  try {
    await execute('DELETE FROM lessons WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('deleteDbLesson error:', error);
    return false;
  }
}

export async function updateDbLesson(
  id: number,
  data: { title?: string; order_index?: number; description?: string }
): Promise<boolean> {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title.trim());
  }
  if (data.order_index !== undefined) {
    updates.push('order_index = ?');
    values.push(data.order_index);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description.trim());
  }

  if (updates.length === 0) return true;

  values.push(id);
  await execute(`UPDATE lessons SET ${updates.join(', ')} WHERE id = ?`, values);
  return true;
}
