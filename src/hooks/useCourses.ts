'use client';

import { useState, useEffect, useMemo } from 'react';
import { Course, CourseFilters, SearchParams } from '@/types';
import { dummyCourses, featuredCourses, categories } from '@/data/courses';

// Custom hook for managing courses data
export const useCourses = (initialParams?: SearchParams) => {
  const [courses, setCourses] = useState<Course[]>(dummyCourses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>(initialParams || {});

  // Filter and search courses based on parameters
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Apply search query
    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tags.some(tag => tag.toLowerCase().includes(query)) ||
        course.instructor.name.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (searchParams.filters) {
      const { category, level, priceRange, rating, language, duration } = searchParams.filters;

      if (category) {
        result = result.filter(course => course.category === category);
      }

      if (level) {
        result = result.filter(course => course.level === level);
      }

      if (priceRange) {
        result = result.filter(course => 
          course.price >= priceRange[0] && course.price <= priceRange[1]
        );
      }

      if (rating) {
        result = result.filter(course => course.rating.average >= rating);
      }

      if (language) {
        result = result.filter(course => course.language === language);
      }

      if (duration) {
        const durationMinutes = course => course.duration;
        switch (duration) {
          case 'short': // < 3 hours
            result = result.filter(course => durationMinutes(course) < 180);
            break;
          case 'medium': // 3-8 hours
            result = result.filter(course => 
              durationMinutes(course) >= 180 && durationMinutes(course) <= 480
            );
            break;
          case 'long': // > 8 hours
            result = result.filter(course => durationMinutes(course) > 480);
            break;
        }
      }
    }

    // Apply sorting
    if (searchParams.filters?.sortBy) {
      switch (searchParams.filters.sortBy) {
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'oldest':
          result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'price-low':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating.average - a.rating.average);
          break;
        case 'popular':
          result.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
          break;
        default:
          break;
      }
    }

    return result;
  }, [courses, searchParams]);

  // Pagination
  const paginatedCourses = useMemo(() => {
    const page = searchParams.page || 1;
    const limit = searchParams.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: filteredCourses.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: filteredCourses.length,
        totalPages: Math.ceil(filteredCourses.length / limit),
      },
    };
  }, [filteredCourses, searchParams.page, searchParams.limit]);

  // Get course by ID
  const getCourseById = (id: string): Course | undefined => {
    return courses.find(course => course.id === id);
  };

  // Get featured courses
  const getFeaturedCourses = (): Course[] => {
    return featuredCourses;
  };

  // Get courses by category
  const getCoursesByCategory = (categoryName: string): Course[] => {
    return courses.filter(course => course.category === categoryName);
  };

  // Get popular courses (by enrollment count)
  const getPopularCourses = (limit: number = 6): Course[] => {
    return [...courses]
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, limit);
  };

  // Get recent courses
  const getRecentCourses = (limit: number = 6): Course[] => {
    return [...courses]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  // Search courses
  const searchCourses = (params: SearchParams) => {
    setLoading(true);
    setSearchParams(params);
    
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Update filters
  const updateFilters = (filters: CourseFilters) => {
    setSearchParams(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      page: 1, // Reset to first page when filters change
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setSearchParams({
      page: 1,
      limit: searchParams.limit,
    });
  };

  // Aggregate statistics
  const stats = useMemo(() => ({
    totalCourses: courses.length,
    totalEnrollments: courses.reduce(
      (sum, course) => sum + course.enrollmentCount,
      0
    ),
    averageRating:
      courses.reduce((sum, course) => sum + course.rating.average, 0) /
      courses.length,
    categories: categories.length,
  }), [courses]);

  return {
    // Data
    courses: paginatedCourses.data,
    allCourses: courses,
    pagination: paginatedCourses.pagination,
    categories,
    
    // State
    loading,
    error,
    searchParams,
    
    // Actions
    searchCourses,
    updateFilters,
    clearFilters,
    
    // Getters
    getCourseById,
    getFeaturedCourses,
    getCoursesByCategory,
    getPopularCourses,
    getRecentCourses,

    // Stats
    stats,
  };
};

// Hook for getting a single course
export const useCourse = (courseId: string) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const foundCourse = dummyCourses.find(c => c.id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
          setError(null);
        } else {
          setError('Course not found');
        }
        setLoading(false);
      }, 300);
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  return { course, loading, error };
};

// Hook for course categories
export const useCategories = () => {
  return {
    categories,
    getCategoryById: (id: string) => categories.find(cat => cat.id === id),
    getCategoryByName: (name: string) => categories.find(cat => cat.name === name),
  };
};