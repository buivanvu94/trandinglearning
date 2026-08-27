import lessonsData from '@/data/lessons.json';
import { Lesson } from '@/types/lesson';

export const LESSONS: Lesson[] = lessonsData as Lesson[];

export function getAllLessons(): Lesson[] {
  return LESSONS;
}

export function getLessonById(id: number | string): Lesson | undefined {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  return LESSONS.find((l) => l.id === numericId);
}

export function getAdjacentLessons(id: number | string): {
  prevLesson?: Lesson;
  nextLesson?: Lesson;
} {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const index = LESSONS.findIndex((l) => l.id === numericId);
  if (index === -1) return {};

  return {
    prevLesson: index > 0 ? LESSONS[index - 1] : undefined,
    nextLesson: index < LESSONS.length - 1 ? LESSONS[index + 1] : undefined,
  };
}

export function getTotalSlideCount(): number {
  return LESSONS.reduce((acc, lesson) => acc + lesson.slide_count, 0);
}

export function getSlideImageUrl(lesson: Lesson, slideIndex: number): string {
  const slide = lesson.slides.find((s) => s.slide_index === slideIndex) || lesson.slides[0];
  if (!slide) return '';
  // relative_path is folder_name/filename
  // Encode folder name and file name for URL safety
  const parts = slide.relative_path.split('/');
  const encodedPath = parts.map((p) => encodeURIComponent(p)).join('/');
  return `/lessons/${encodedPath}`;
}
