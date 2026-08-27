export interface Slide {
  slide_index: number;
  filename: string;
  relative_path: string;
  width: number;
  height: number;
  format: string;
  size_bytes: number;
}

export interface Lesson {
  id: number;
  title: string;
  folder_name: string;
  slide_count: number;
  slides: Slide[];
}

export interface Bookmark {
  lessonId: number;
  slideIndex: number;
  addedAt: string;
  note?: string;
}

export interface LessonProgress {
  completedSlides: number[];
  lastSlide: number;
  isCompleted: boolean;
  lastViewedAt: string;
}

export type ViewMode = 'slide' | 'scroll' | 'grid';
