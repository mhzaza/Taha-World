'use client';

interface SkeletonLoaderProps {
  variant?: 'course' | 'player' | 'list' | 'card' | 'default';
  count?: number;
}

export default function SkeletonLoader({ variant = 'default', count = 1 }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'course':
        return <CoursePageSkeleton />;
      case 'player':
        return <PlayerSkeleton />;
      case 'list':
        return <ListSkeleton count={count} />;
      case 'card':
        return <CardSkeleton />;
      default:
        return <DefaultSkeleton />;
    }
  };

  return (
    <div className="animate-pulse">
      {renderSkeleton()}
    </div>
  );
}

// Course Page Skeleton
const CoursePageSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header Skeleton */}
    <div className="bg-gradient-to-r from-gray-300 to-gray-400 h-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="flex gap-4">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="aspect-video bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Player Skeleton */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-600">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="aspect-video bg-gray-200"></div>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-600">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-600 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Player Skeleton
const PlayerSkeleton = () => (
  <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
    <div className="p-6 border-b border-gray-600">
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
    <div className="aspect-video bg-gray-200 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
        <div className="h-2 bg-gray-300 rounded w-24 mx-auto"></div>
      </div>
    </div>
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  </div>
);

// List Skeleton
const ListSkeleton = ({ count }: { count: number }) => (
  <div className="space-y-2">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="border border-gray-600 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Card Skeleton
const CardSkeleton = () => (
  <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
    <div className="aspect-video bg-gray-200"></div>
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

// Default Skeleton
const DefaultSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Pulse Animation Component
export const PulseLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} bg-[#41ADE1] rounded-full animate-pulse`}></div>
    </div>
  );
};

// Shimmer Effect Component
export const ShimmerLoader = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] ${className}`}></div>
);

// Loading Dots Component
export const DotsLoader = () => (
  <div className="flex items-center justify-center space-x-1">
    <div className="w-2 h-2 bg-[#41ADE1] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-[#41ADE1] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-[#41ADE1] rounded-full animate-bounce"></div>
  </div>
);
