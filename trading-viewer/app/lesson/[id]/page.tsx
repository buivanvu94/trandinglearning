'use client';

import React, { useState, useEffect, useCallback, use, Suspense } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import { getLessonById } from '@/lib/lessons';
import { useLessons } from '@/hooks/useLessons';
import { useCourseProgress } from '@/hooks/useCourseProgress';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SlidePlayer } from '@/components/SlidePlayer';
import { ScrollStoryboard } from '@/components/ScrollStoryboard';
import { GridViewer } from '@/components/GridViewer';
import { ZoomModal } from '@/components/ZoomModal';
import { NotesDrawer } from '@/components/NotesDrawer';
import { BookmarksModal } from '@/components/BookmarksModal';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

function LessonContent({ params }: LessonPageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const { getLesson, isLoading: isLessonsLoading } = useLessons();

  const lesson = getLesson(resolvedParams.id) || getLessonById(resolvedParams.id);

  const {
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
  } = useCourseProgress();

  const initialSlide = searchParams.get('slide')
    ? parseInt(searchParams.get('slide')!, 10)
    : lesson ? progress[lesson.id]?.lastSlide || 1 : 1;

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(
    Math.max(1, Math.min(initialSlide, lesson?.slide_count || 1))
  );

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (lesson) {
      markSlideViewed(lesson.id, activeSlideIndex, lesson.slide_count);
    }
  }, [lesson, activeSlideIndex, markSlideViewed]);

  const handleSlideChange = useCallback(
    (newIndex: number) => {
      if (!lesson) return;
      const clamped = Math.max(1, Math.min(newIndex, lesson.slide_count));
      setActiveSlideIndex(clamped);
    },
    [lesson]
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lesson) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleSlideChange(activeSlideIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSlideChange(activeSlideIndex - 1);
      } else if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setIsZoomOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNotesOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleBookmark(lesson.id, activeSlideIndex);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === '1') {
        e.preventDefault();
        updateViewMode('slide');
      } else if (e.key === '2') {
        e.preventDefault();
        updateViewMode('scroll');
      } else if (e.key === '3') {
        e.preventDefault();
        updateViewMode('grid');
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeSlideIndex,
    handleSlideChange,
    lesson,
    toggleBookmark,
    toggleFullscreen,
    updateViewMode,
  ]);

  if (!lesson) {
    if (isLessonsLoading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#000000] text-[#86868b]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#2997ff]/30 border-t-[#2997ff] rounded-full animate-spin" />
            <span className="text-xs">Đang tải bài giảng 2K...</span>
          </div>
        </div>
      );
    }
    notFound();
  }

  const isCurrentBookmarked = isSlideBookmarked(lesson.id, activeSlideIndex);
  const currentNote = getSlideNote(lesson.id, activeSlideIndex);
  const hasCurrentNote = Boolean(currentNote && currentNote.trim().length > 0);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#000000] text-[#f5f5f7] antialiased selection:bg-[#2997ff]/30">
      {/* Sidebar Navigation */}
      <Sidebar
        progress={progress}
        bookmarks={bookmarks}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenBookmarksModal={() => setIsBookmarksOpen(true)}
      />

      {/* Main Study Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Header */}
        <Header
          lesson={lesson}
          activeSlideIndex={activeSlideIndex}
          viewMode={viewMode}
          onViewModeChange={updateViewMode}
          isBookmarked={isCurrentBookmarked}
          onToggleBookmark={() => toggleBookmark(lesson.id, activeSlideIndex)}
          hasNote={hasCurrentNote}
          onOpenNotes={() => setIsNotesOpen(true)}
          onOpenZoom={() => setIsZoomOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Content Viewer Switcher */}
        <main className="flex-1 flex min-h-0 overflow-hidden relative">
          {viewMode === 'slide' && (
            <SlidePlayer
              lesson={lesson}
              activeSlideIndex={activeSlideIndex}
              onSlideChange={handleSlideChange}
              isBookmarked={isCurrentBookmarked}
              onToggleBookmark={() => toggleBookmark(lesson.id, activeSlideIndex)}
              hasNote={hasCurrentNote}
              onOpenNotes={() => setIsNotesOpen(true)}
              onOpenZoom={() => setIsZoomOpen(true)}
              onToggleFullscreen={toggleFullscreen}
            />
          )}

          {viewMode === 'scroll' && (
            <ScrollStoryboard
              lesson={lesson}
              activeSlideIndex={activeSlideIndex}
              onSlideChange={handleSlideChange}
              isSlideBookmarked={isSlideBookmarked}
              onToggleBookmark={toggleBookmark}
              getSlideNote={getSlideNote}
              saveNote={saveNote}
              onOpenZoom={(idx) => {
                setActiveSlideIndex(idx);
                setIsZoomOpen(true);
              }}
            />
          )}

          {viewMode === 'grid' && (
            <GridViewer
              lesson={lesson}
              activeSlideIndex={activeSlideIndex}
              onSelectSlide={(idx) => {
                setActiveSlideIndex(idx);
                updateViewMode('slide');
              }}
              isSlideBookmarked={isSlideBookmarked}
              onToggleBookmark={toggleBookmark}
              getSlideNote={getSlideNote}
              onOpenZoom={(idx) => {
                setActiveSlideIndex(idx);
                setIsZoomOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      <ZoomModal
        lesson={lesson}
        activeSlideIndex={activeSlideIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        onNavigateSlide={handleSlideChange}
      />

      <NotesDrawer
        lesson={lesson}
        activeSlideIndex={activeSlideIndex}
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        getSlideNote={getSlideNote}
        saveNote={saveNote}
        onJumpToSlide={handleSlideChange}
      />

      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={(lId, sIdx) => toggleBookmark(lId, sIdx)}
        onNavigateToSlide={(lId, sIdx) => {
          if (lId === lesson.id) {
            handleSlideChange(sIdx);
          } else {
            window.location.href = `/lesson/${lId}?slide=${sIdx}`;
          }
        }}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default function LessonPage(props: LessonPageProps) {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-[#000000] text-[#86868b]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#2997ff]/30 border-t-[#2997ff] rounded-full animate-spin" />
            <span className="text-xs">Đang nạp bài giảng...</span>
          </div>
        </div>
      }
    >
      <LessonContent {...props} />
    </Suspense>
  );
}
