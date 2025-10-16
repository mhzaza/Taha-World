'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layout, Container } from '@/components/layout';
import { useCourses } from '@/hooks/useCourses';
import { CourseFilters } from '@/types';
import ClientOnly from '@/components/ClientOnly';

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    courses,
    pagination,
    loading,
    searchParams,
    searchCourses,
    updateFilters,
    clearFilters,
    stats,
  } = useCourses();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCourses({ query: searchQuery, page: 1 });
  };

  const handleFilterChange = <K extends keyof CourseFilters>(
    filterKey: K,
    value: CourseFilters[K]
  ) => {
    updateFilters({ [filterKey]: value });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ساعة${mins > 0 ? ` و ${mins} دقيقة` : ''}`;
    }
    return `${mins} دقيقة`;
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price} ${currency === 'USD' ? '$' : currency}`;
  };

  return (
    <Layout>
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-16">
        <Container>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              دوراتنا التدريبية
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              اكتشف مجموعة واسعة من الدورات التدريبية المتخصصة في الرياضة واللياقة البدنية
            </p>
          </div>
          <ClientOnly>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.totalCourses}</div>
                <div className="text-gray-600">دورة تدريبية</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.totalEnrollments.toLocaleString()}</div>
                <div className="text-gray-600">متدرب</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
                <div className="text-gray-600">تقييم متوسط</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.categories.length}</div>
                <div className="text-gray-600">فئة</div>
              </div>
            </div>
          </ClientOnly>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن الدورات..."
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                بحث
              </button>
            </div>
          </form>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">تصفية النتائج</h3>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    مسح الكل
                  </button>
                </div>
                <ClientOnly>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">الفئة</h4>
                    <div className="space-y-2">
                      {stats.categories.map((category) => (
                        <label key={category.id} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value={category.name}
                            checked={searchParams.filters?.category === category.name}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="ml-2"
                          />
                          <span className="text-gray-700">
                            {category.name} ({category.courseCount})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">المستوى</h4>
                    <div className="space-y-2">
                      {['beginner', 'intermediate', 'advanced'].map((level) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="radio"
                            name="level"
                            value={level}
                            checked={searchParams.filters?.level === level}
                            onChange={(e) => handleFilterChange('level', e.target.value)}
                            className="ml-2"
                          />
                          <span className="text-gray-700">
                            {level === 'beginner' ? 'مبتدئ' : 
                             level === 'intermediate' ? 'متوسط' : 'متقدم'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">السعر</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="price"
                          value="0-50"
                          onChange={() => handleFilterChange('priceRange', [0, 50])}
                          className="ml-2"
                        />
                        <span className="text-gray-700">أقل من 50$</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="price"
                          value="50-100"
                          onChange={() => handleFilterChange('priceRange', [50, 100])}
                          className="ml-2"
                        />
                        <span className="text-gray-700">50$ - 100$</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="price"
                          value="100+"
                          onChange={() => handleFilterChange('priceRange', [100, 1000])}
                          className="ml-2"
                        />
                        <span className="text-gray-700">أكثر من 100$</span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">ترتيب حسب</h4>
                    <select
                      value={searchParams.filters?.sortBy || ''}
onChange={(e) => handleFilterChange('sortBy', e.target.value as CourseFilters['sortBy'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">الافتراضي</option>
                      <option value="newest">الأحدث</option>
                      <option value="popular">الأكثر شعبية</option>
                      <option value="rating">الأعلى تقييماً</option>
                      <option value="price-low">السعر: من الأقل للأعلى</option>
                      <option value="price-high">السعر: من الأعلى للأقل</option>
                    </select>
                  </div>
                </ClientOnly>
              </div>
            </div>

            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">جاري التحميل...</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {pagination.total} دورة تدريبية
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-48 w-full object-cover"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="h-48 bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center"
                            style={{ display: course.thumbnail ? 'none' : 'flex' }}
                          >
                            <div className="text-white text-6xl font-bold opacity-20">
                              {course.title.charAt(0)}
                            </div>
                          </div>
                          {course.isFeatured && (
                            <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium">
                              مميز
                            </div>
                          )}
                          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                            {formatDuration(course.duration)}
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                              {course.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              {course.level === 'beginner' ? 'مبتدئ' : 
                               course.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {course.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {course.description}
                          </p>
                          
                          <div className="flex items-center mb-4">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(course.rating?.average || 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-sm text-gray-600 mr-2">
                                {course.rating?.average || 0} ({course.rating?.count || 0})
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span className="text-2xl font-bold text-blue-600">
                                {formatPrice(course.price, course.currency)}
                              </span>
                              {course.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(course.originalPrice, course.currency)}
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/courses/${course.id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              عرض التفاصيل
                            </Link>
                          </div>
                          
                          <div className="mt-4 text-xs text-gray-500">
                            {(course.enrollmentCount || 0).toLocaleString()} متدرب مسجل
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <div className="flex space-x-2 space-x-reverse">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => searchCourses({ ...searchParams, page })}
                            className={`px-4 py-2 rounded-md ${
                              page === pagination.page
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
};

export default CoursesPage;