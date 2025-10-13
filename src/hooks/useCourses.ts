// src/hooks/useCourses.ts

'use client';
import { useState, useMemo, useEffect } from 'react';
import { Course, CourseFilters, SearchParams } from '@/types';

export const useCourses = (initialParams?: SearchParams) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>(initialParams || {});

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('فشل في جلب الدورات');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(query) ||
        (course.description && course.description.toLowerCase().includes(query))
      );
    }

    if (searchParams.filters) {
      // Add other filters if needed
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

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const totalEnrollments = courses.reduce((sum, course) => sum + course.enrollmentCount, 0);
    const averageRating = totalCourses > 0 
      ? courses.reduce((sum, course) => sum + (course.rating?.average || 0), 0) / totalCourses 
      : 0;

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
      totalCourses,
      totalEnrollments,
      averageRating,
      categories: categoryStats,
    };
  }, [courses]);

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
    courses: paginatedCourses.data,
    pagination: paginatedCourses.pagination,
    loading,
    error,
    searchParams,
    searchCourses,
    updateFilters,
    clearFilters,
    getCourseById,
    stats,
  };
};