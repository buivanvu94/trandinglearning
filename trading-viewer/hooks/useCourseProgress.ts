'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bookmark, LessonProgress, ViewMode } from '@/types/lesson';
import { LESSONS, getTotalSlideCount } from '@/lib/lessons';

const PROGRESS_KEY = 'trading_course_progress_v1';
const BOOKMARKS_KEY = 'trading_course_bookmarks_v1';
const NOTES_KEY = 'trading_course_notes_v1';
const VIEW_MODE_KEY = 'trading_course_view_mode_v1';

export function useCourseProgress() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState<Record<number, LessonProgress>>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('slide');

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedProgress = localStorage.getItem(PROGRESS_KEY);
      if (storedProgress) {
        setProgress(JSON.parse(storedProgress));
      }

      const storedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }

      const storedNotes = localStorage.getItem(NOTES_KEY);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }

      const storedViewMode = localStorage.getItem(VIEW_MODE_KEY) as ViewMode;
      if (storedViewMode && ['slide', 'scroll', 'grid'].includes(storedViewMode)) {
        setViewMode(storedViewMode);
      }
    } catch (e) {
      console.error('Failed to load course progress from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save progress
  const markSlideViewed = useCallback((lessonId: number, slideIndex: number, totalSlides: number) => {
    setProgress((prev) => {
      const current = prev[lessonId] || {
        completedSlides: [],
        lastSlide: 1,
        isCompleted: false,
        lastViewedAt: new Date().toISOString(),
      };

      const completedSet = new Set(current.completedSlides);
      completedSet.add(slideIndex);
      const updatedCompleted = Array.from(completedSet);
      const isCompleted = updatedCompleted.length >= totalSlides;

      const nextState = {
        ...prev,
        [lessonId]: {
          completedSlides: updatedCompleted,
          lastSlide: slideIndex,
          isCompleted,
          lastViewedAt: new Date().toISOString(),
        },
      };

      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextState));
      } catch (e) {
        console.error('Error saving progress:', e);
      }

      return nextState;
    });
  }, []);

  // Toggle Bookmark
  const toggleBookmark = useCallback((lessonId: number, slideIndex: number, note?: string) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.lessonId === lessonId && b.slideIndex === slideIndex);
      let nextBookmarks: Bookmark[];

      if (exists) {
        nextBookmarks = prev.filter((b) => !(b.lessonId === lessonId && b.slideIndex === slideIndex));
      } else {
        nextBookmarks = [
          ...prev,
          {
            lessonId,
            slideIndex,
            addedAt: new Date().toISOString(),
            note,
          },
        ];
      }

      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(nextBookmarks));
      } catch (e) {
        console.error('Error saving bookmarks:', e);
      }

      return nextBookmarks;
    });
  }, []);

  const isSlideBookmarked = useCallback(
    (lessonId: number, slideIndex: number) => {
      return bookmarks.some((b) => b.lessonId === lessonId && b.slideIndex === slideIndex);
    },
    [bookmarks]
  );

  // Save Note for specific slide
  const saveNote = useCallback((lessonId: number, slideIndex: number, content: string) => {
    const key = `${lessonId}_${slideIndex}`;
    setNotes((prev) => {
      const nextNotes = { ...prev };
      if (!content.trim()) {
        delete nextNotes[key];
      } else {
        nextNotes[key] = content;
      }

      try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(nextNotes));
      } catch (e) {
        console.error('Error saving notes:', e);
      }

      return nextNotes;
    });
  }, []);

  const getSlideNote = useCallback(
    (lessonId: number, slideIndex: number) => {
      return notes[`${lessonId}_${slideIndex}`] || '';
    },
    [notes]
  );

  // Change View Mode
  const updateViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch (e) {
      console.error('Error saving view mode:', e);
    }
  }, []);

  // Overall Stats
  const totalSlides = getTotalSlideCount();
  const completedSlidesCount = Object.values(progress).reduce(
    (sum, p) => sum + (p.completedSlides ? p.completedSlides.length : 0),
    0
  );
  const completedLessonsCount = Object.values(progress).filter((p) => p.isCompleted).length;
  const overallPercentage = totalSlides > 0 ? Math.round((completedSlidesCount / totalSlides) * 100) : 0;

  return {
    isLoaded,
    progress,
    bookmarks,
    notes,
    viewMode,
    markSlideViewed,
    toggleBookmark,
    isSlideBookmarked,
    saveNote,
    getSlideNote,
    updateViewMode,
    stats: {
      totalSlides,
      completedSlidesCount,
      completedLessonsCount,
      totalLessons: LESSONS.length,
      overallPercentage,
    },
  };
}
