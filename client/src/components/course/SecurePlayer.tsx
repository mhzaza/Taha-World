'use client';

import { useEffect, useRef, useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';

interface SecurePlayerProps {
  url: string;
  title: string;
  autoplay?: boolean;
}

export default function SecurePlayer({ url, title, autoplay = false }: SecurePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
      if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = getYouTubeVideoId(url);

  // Disable right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const playerElement = playerRef.current;
    if (playerElement) {
      playerElement.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        playerElement.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Disable keyboard shortcuts and developer tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">خطأ في تحميل الفيديو</h3>
          <p className="text-gray-300">رابط الفيديو غير صحيح</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">فشل في تحميل الفيديو</h3>
          <p className="text-gray-300">يرجى المحاولة مرة أخرى</p>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?` + new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: '1',
    disablekb: '1', // Disable keyboard controls
    fs: '0', // Disable fullscreen
    modestbranding: '1', // Remove YouTube logo
    rel: '0', // Don't show related videos
    showinfo: '0', // Don't show video info
    iv_load_policy: '3', // Don't show annotations
    cc_load_policy: '0', // Don't show captions by default
    playsinline: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : '',
  }).toString();

  return (
    <div 
      ref={playerRef}
      className="relative aspect-video bg-gray-900 overflow-hidden select-none"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-[#41ADE1] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <PlayIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">جاري تحميل الفيديو...</h3>
            <div className="w-32 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-[#41ADE1] rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={false}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{
          pointerEvents: 'auto',
          border: 'none',
          outline: 'none'
        }}
      />

      {/* Overlay to prevent right-click (invisible) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'transparent',
          zIndex: 1
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
      />

      {/* Security Notice (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          🔒 محمي
        </div>
      )}
    </div>
  );
}

// Additional security: Disable drag and drop
export const PlayerContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      onDragStart={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      onDragOver={(e) => e.preventDefault()}
      style={{
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserDrag: 'none',
        KhtmlUserSelect: 'none'
      } as any}
    >
      {children}
    </div>
  );
};