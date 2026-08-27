'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lesson } from '@/types/lesson';
import { LESSONS as STATIC_LESSONS } from '@/lib/lessons';

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>(STATIC_LESSONS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await fetch('/api/lessons');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.lessons) && data.lessons.length > 0) {
          setLessons(data.lessons);
        }
      }
    } catch {
      // Fallback to static lessons
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const getLesson = useCallback(
    (id: number | string): Lesson | undefined => {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      return lessons.find((l) => l.id === numericId);
    },
    [lessons]
  );

  const getAdjacent = useCallback(
    (id: number | string) => {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      const index = lessons.findIndex((l) => l.id === numericId);
      if (index === -1) return {};

      return {
        prevLesson: index > 0 ? lessons[index - 1] : undefined,
        nextLesson: index < lessons.length - 1 ? lessons[index + 1] : undefined,
      };
    },
    [lessons]
  );

  return {
    lessons,
    isLoading,
    getLesson,
    getAdjacent,
    refreshLessons: fetchLessons,
    totalSlides: lessons.reduce((acc, l) => acc + l.slide_count, 0),
  };
}
