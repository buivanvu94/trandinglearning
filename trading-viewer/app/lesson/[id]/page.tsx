'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import { getLessonById } from '@/lib/lessons';
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

export default function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();

  const lesson = getLessonById(resolvedParams.id);
  if (!lesson) {
    notFound();
  }

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
    : progress[lesson.id]?.lastSlide || 1;

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(
    Math.max(1, Math.min(initialSlide, lesson.slide_count))
  );

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    markSlideViewed(lesson.id, activeSlideIndex, lesson.slide_count);
  }, [lesson.id, activeSlideIndex, lesson.slide_count, markSlideViewed]);

  const handleSlideChange = useCallback(
    (newIndex: number) => {
      const clamped = Math.max(1, Math.min(newIndex, lesson.slide_count));
      setActiveSlideIndex(clamped);
    },
    [lesson.slide_count]
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
    lesson.id,
    toggleBookmark,
    toggleFullscreen,
    updateViewMode,
  ]);

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
