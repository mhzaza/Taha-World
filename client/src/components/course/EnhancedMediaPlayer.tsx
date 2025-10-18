'use client';

import { useEffect, useRef, useState } from 'react';
import { PlayIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { EyeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface EnhancedMediaPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title: string;
  autoplay?: boolean;
  isLocked?: boolean;
  onUnlock?: () => void;
  showPreview?: boolean;
}

export default function EnhancedMediaPlayer({ 
  videoUrl, 
  thumbnailUrl, 
  title, 
  autoplay = false,
  isLocked = false,
  onUnlock,
  showPreview = false
}: EnhancedMediaPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
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

  const videoId = videoUrl ? getYouTubeVideoId(videoUrl) : null;
  const hasValidVideo = Boolean(videoId);

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

  // Auto-show video if available and not locked
  useEffect(() => {
    if (hasValidVideo && !isLocked) {
      setShowVideo(true);
    }
  }, [hasValidVideo, isLocked]);

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

  // Render locked state
  if (isLocked) {
    return (
      <div 
        ref={playerRef}
        className="relative aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden select-none rounded-xl"
      >
        {/* Background Image */}
        {thumbnailUrl && (
          <div className="absolute inset-0">
            <img 
              src={thumbnailUrl} 
              alt={title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>
        )}
        
        {/* Lock Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-md px-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white border-opacity-30">
              <LockClosedIcon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-3">المحتوى محمي</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              للوصول إلى هذا المحتوى، يرجى شراء الدورة أو تسجيل الدخول إلى حسابك
            </p>
            {onUnlock && (
              <button
                onClick={onUnlock}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                <EyeIcon className="w-5 h-5 ml-2" />
                عرض المحتوى
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render image when no video or video not shown yet
  if (!hasValidVideo || (!showVideo && thumbnailUrl)) {
    return (
      <div 
        ref={playerRef}
        className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden select-none rounded-xl group cursor-pointer"
        onClick={() => hasValidVideo && setShowVideo(true)}
      >
        {thumbnailUrl ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setIsLoading(false)}
              onError={() => setHasError(true)}
            />
            
            {/* Play Button Overlay (if video available) */}
            {hasValidVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                <div className="w-20 h-20 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                  <PlayIcon className="w-8 h-8 text-gray-800 mr-1" />
                </div>
              </div>
            )}
            
            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
              <h3 className="text-white text-lg font-semibold leading-tight">{title}</h3>
              {hasValidVideo && (
                <p className="text-gray-300 text-sm mt-1">انقر للمشاهدة</p>
              )}
            </div>
          </>
        ) : (
          // Fallback when no thumbnail
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhotoIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-gray-400">لا توجد صورة متاحة</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render video player
  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center rounded-xl">
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
      <div className="aspect-video bg-gray-900 flex items-center justify-center rounded-xl">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">فشل في تحميل الفيديو</h3>
          <p className="text-gray-300">يرجى المحاولة مرة أخرى</p>
          {thumbnailUrl && (
            <button
              onClick={() => setShowVideo(false)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              عرض الصورة بدلاً من ذلك
            </button>
          )}
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?` + new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: '1',
    disablekb: '1',
    fs: '0',
    modestbranding: '1',
    rel: '0',
    showinfo: '0',
    iv_load_policy: '3',
    cc_load_policy: '0',
    playsinline: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : '',
  }).toString();

  return (
    <div 
      ref={playerRef}
      className="relative aspect-video bg-gray-900 overflow-hidden select-none rounded-xl shadow-2xl"
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
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <PlayIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">جاري تحميل الفيديو...</h3>
            <div className="w-32 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full rounded-xl"
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

      {/* Back to Image Button */}
      {thumbnailUrl && (
        <button
          onClick={() => setShowVideo(false)}
          className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 backdrop-blur-sm"
        >
          عرض الصورة
        </button>
      )}

      {/* Overlay to prevent right-click */}
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
