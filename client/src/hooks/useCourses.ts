// src/hooks/useCourses.ts

'use client';
import { useState, useMemo, useEffect } from 'react';
import { Course, CourseFilters, SearchParams } from '@/types';
import { courseAPI } from '@/lib/api';

interface CourseStats {
  totalCourses: number;
  totalEnrollments: number;
  averageRating: number;
  categories: number;
}

export const useCourses = (initialParams?: SearchParams) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>(initialParams || {});
  const [stats, setStats] = useState<CourseStats>({
    totalCourses: 0,
    totalEnrollments: 0,
    averageRating: 0,
    categories: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchCourses = async (params: SearchParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string from search parameters
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.query) queryParams.append('search', params.query);
      
      if (params.filters) {
        if (params.filters.category) queryParams.append('category', params.filters.category);
        if (params.filters.level) queryParams.append('level', params.filters.level);
        if (params.filters.language) queryParams.append('language', params.filters.language);
        if (params.filters.featured !== undefined) queryParams.append('featured', params.filters.featured.toString());
        if (params.filters.priceRange) {
          queryParams.append('minPrice', params.filters.priceRange[0].toString());
          queryParams.append('maxPrice', params.filters.priceRange[1].toString());
        }
        if (params.filters.sortBy) {
          // Map frontend sort options to backend sort parameters
          switch (params.filters.sortBy) {
            case 'newest':
              queryParams.append('sort', 'createdAt');
              queryParams.append('order', 'desc');
              break;
            case 'popular':
              queryParams.append('sort', 'enrollmentCount');
              queryParams.append('order', 'desc');
              break;
            case 'rating':
              queryParams.append('sort', 'rating.average');
              queryParams.append('order', 'desc');
              break;
            case 'price-low':
              queryParams.append('sort', 'price');
              queryParams.append('order', 'asc');
              break;
            case 'price-high':
              queryParams.append('sort', 'price');
              queryParams.append('order', 'desc');
              break;
          }
        }
      }

      const queryString = queryParams.toString();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(`${backendUrl}/api/courses${queryString ? `?${queryString}` : ''}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.arabic || errorData.error || 'فشل في جلب الدورات');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses || []);
        setPagination(data.pagination || {
          page: 1,
          totalPages: 1,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        throw new Error(data.arabic || data.error || 'فشل في جلب الدورات');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await courseAPI.getStats();
      if (response.data && response.data.data) {
        // The API returns the stats in response.data.data
        const statsData = response.data.data;
        setStats({
          totalCourses: statsData.totalCourses,
          totalEnrollments: statsData.totalEnrollments,
          averageRating: statsData.averageRating,
          categories: statsData.categories || 0 // Fallback to 0 if categories is not provided
        });
      }
    } catch (err) {
      console.error('Error fetching course stats:', err);
      // Keep default stats if fetch fails
    }
  };

  useEffect(() => {
    fetchCourses(searchParams);
  }, [searchParams]);

  // Fetch stats when component mounts
  useEffect(() => {
    fetchStats();
  }, []);

  // Use dynamic stats from API instead of calculating from courses array
  // This ensures we get global statistics, not just from the current page
  const courseStats = useMemo(() => {
    // We still calculate categories from the loaded courses for the filter
    const categoriesCount = courses.reduce((acc, course) => {
      if (course.category) {
        acc[course.category] = (acc[course.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const categoryStats = Object.entries(categoriesCount).map(([name, count]) => ({
        id: name,
        name,
        courseCount: count,
    }));

    return {
      totalCourses: stats.totalCourses,
      totalEnrollments: stats.totalEnrollments,
      averageRating: stats.averageRating,
      categories: categoryStats,
    };
  }, [courses, stats]);

  const getCourseById = (id: string): Course | undefined => {
    return courses.find(course => course.id === id);
  };

  const searchCourses = (params: SearchParams) => {
    setSearchParams(params);
  };

  const updateFilters = (filters: CourseFilters) => {
    setSearchParams(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchParams({
      page: 1,
      limit: searchParams.limit,
    });
  };

  return {
    courses,
    pagination,
    loading,
    error,
    searchParams,
    searchCourses,
    updateFilters,
    clearFilters,
    getCourseById,
    stats: courseStats,
  };
};