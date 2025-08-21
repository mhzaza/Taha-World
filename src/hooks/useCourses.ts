'use client';

import { useState, useMemo } from 'react';
import { Course, CourseFilters, SearchParams } from '@/types';
import { dummyCourses, featuredCourses, categories } from '@/data/courses';

export const useCourses = (initialParams?: SearchParams) => {
  const [courses, setCourses] = useState<Course[]>(dummyCourses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>(initialParams || {});

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tags.some(tag => tag.toLowerCase().includes(query)) ||
        course.instructor.name.toLowerCase().includes(query)
      );
    }

    if (searchParams.filters) {
      const { category, level, priceRange, rating, language, duration, sortBy } = searchParams.filters;

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
        const durationMinutes = (c: Course) => c.duration;
        switch (duration) {
          case 'short':
            result = result.filter(course => durationMinutes(course) < 180);
            break;
          case 'medium':
            result = result.filter(course => 
              durationMinutes(course) >= 180 && durationMinutes(course) <= 480
            );
            break;
          case 'long':
            result = result.filter(course => durationMinutes(course) > 480);
            break;
        }
      }
      if (sortBy) {
        switch (sortBy) {
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
        }
      }
    }

    return result;
  }, [courses, searchParams]);

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

  const getCourseById = (id: string): Course | undefined => {
    return courses.find(course => course.id === id);
  };

  const getFeaturedCourses = (): Course[] => {
    return featuredCourses;
  };

  const getCoursesByCategory = (categoryName: string): Course[] => {
    return courses.filter(course => course.category === categoryName);
  };

  const getPopularCourses = (limit: number = 6): Course[] => {
    return [...courses]
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, limit);
  };

  const getRecentCourses = (limit: number = 6): Course[] => {
    return [...courses]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  const searchCourses = (params: SearchParams) => {
    setLoading(true);
    setSearchParams(params);
    setTimeout(() => {
      setLoading(false);
    }, 500);
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

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const totalEnrollments = courses.reduce((sum, course) => sum + course.enrollmentCount, 0);
    const averageRating = totalCourses > 0 ? courses.reduce((sum, course) => sum + course.rating.average, 0) / totalCourses : 0;
    
    const categoriesCount = courses.reduce((acc, course) => {
      acc[course.category] = (acc[course.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryStats = Object.entries(categoriesCount).map(([name, count]) => ({
        id: name,
        name,
        courseCount: count,
    }));

    return {
      totalCourses,
      totalEnrollments,
      averageRating,
      categories: categoryStats,
    };
  }, [courses]);

  return {
    courses: paginatedCourses.data,
    allCourses: courses,
    pagination: paginatedCourses.pagination,
    categories,
    loading,
    error,
    searchParams,
    searchCourses,
    updateFilters,
    clearFilters,
    getCourseById,
    getFeaturedCourses,
    getCoursesByCategory,
    getPopularCourses,
    getRecentCourses,
    stats,
  };
};

export const useCourse = (courseId: string) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    const fetchCourse = () => {
      setLoading(true);
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
  }); // Remove the courseId dependency since useState doesn't accept dependencies

  return { course, loading, error };
};

export const useCategories = () => {
  return {
    categories,
    getCategoryById: (id: string) => categories.find(cat => cat.id === id),
    getCategoryByName: (name: string) => categories.find(cat => cat.name === name),
  };
};