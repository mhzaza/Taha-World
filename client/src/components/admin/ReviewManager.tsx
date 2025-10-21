'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

interface Review {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  userId: {
    _id: string;
    displayName: string;
    email: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  isVisible: boolean;
  helpfulVotes: number;
  totalVotes: number;
  helpfulPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewManagerProps {
  courseId?: string;
}

const AR = {
  pageTitle: 'إدارة التقييمات',
  loading: 'جاري التحميل...',
  noReviews: 'لا توجد تقييمات',
  course: 'الدورة',
  user: 'المستخدم',
  rating: 'التقييم',
  title: 'العنوان',
  comment: 'التعليق',
  status: 'الحالة',
  actions: 'الإجراءات',
  visible: 'مرئي',
  hidden: 'مخفي',
  verified: 'مُتحقق',
  notVerified: 'غير مُتحقق',
  toggleVisibility: 'تبديل الرؤية',
  delete: 'حذف',
  confirmDelete: 'هل أنت متأكد من حذف هذا التقييم؟',
  yes: 'نعم',
  no: 'لا',
  error: 'حدث خطأ',
  success: 'تم بنجاح',
  filterByCourse: 'تصفية حسب الدورة',
  allCourses: 'جميع الدورات',
  filterByStatus: 'تصفية حسب الحالة',
  allStatuses: 'جميع الحالات',
  showVisible: 'المرئية فقط',
  showHidden: 'المخفية فقط',
  search: 'بحث',
  searchPlaceholder: 'ابحث في التقييمات...',
  page: 'صفحة',
  of: 'من',
  previous: 'السابق',
  next: 'التالي',
  totalReviews: 'إجمالي التقييمات',
  averageRating: 'متوسط التقييم',
  ratingDistribution: 'توزيع التقييمات',
  stars: 'نجمة',
  starsPlural: 'نجمات',
};

export default function ReviewManager({ courseId }: ReviewManagerProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    courseId: courseId || '',
    isVisible: '',
    search: ''
  });

  const loadReviews = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      });

      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.isVisible) params.append('isVisible', filters.isVisible);

      const response = await fetch(`${backendUrl}/api/reviews/admin?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews);
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.totalItems);
        }
      } else {
        setError(AR.error);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(AR.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [filters, courseId]);

  const handleToggleVisibility = async (reviewId: string) => {
    try {
      const token = Cookies.get('token');
      if (!token) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(`${backendUrl}/api/reviews/${reviewId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadReviews(page);
      }
    } catch (err) {
      console.error('Error toggling visibility:', err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm(AR.confirmDelete)) return;

    try {
      const token = Cookies.get('token');
      if (!token) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(`${backendUrl}/api/reviews/admin/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadReviews(page);
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1 space-x-reverse">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarIcon className="w-4 h-4 text-yellow-400" />
            ) : (
              <StarOutline className="w-4 h-4 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      calendar: 'gregory',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-gray-100 pb-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-600">
        <h2 className="text-xl font-semibold text-gray-900">{AR.pageTitle}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {AR.totalReviews}: {totalItems}
        </p>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-600 bg-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              {AR.filterByCourse}
            </label>
            <select
              value={filters.courseId}
              onChange={(e) => setFilters(prev => ({ ...prev, courseId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{AR.allCourses}</option>
              {/* You can populate this with actual courses */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              {AR.filterByStatus}
            </label>
            <select
              value={filters.isVisible}
              onChange={(e) => setFilters(prev => ({ ...prev, isVisible: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{AR.allStatuses}</option>
              <option value="true">{AR.showVisible}</option>
              <option value="false">{AR.showHidden}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              {AR.search}
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder={AR.searchPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {AR.course}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {AR.user}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {AR.rating}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {AR.title}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {AR.status}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {AR.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-600">
            {reviews.map((review) => (
              <tr key={review._id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {review.courseId.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                      <span className="text-blue-600 font-semibold text-sm">
                        {review.userId.displayName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {review.userId.displayName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {review.userId.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStars(review.rating)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {review.title}
                  </div>
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {review.comment}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      review.isVisible 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {review.isVisible ? AR.visible : AR.hidden}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      review.isVerified 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-700 text-gray-800'
                    }`}>
                      {review.isVerified ? AR.verified : AR.notVerified}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleToggleVisibility(review._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        review.isVisible
                          ? 'text-yellow-600 hover:bg-yellow-100'
                          : 'text-green-600 hover:bg-green-100'
                      }`}
                      title={AR.toggleVisibility}
                    >
                      {review.isVisible ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title={AR.delete}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-200">
              {AR.page} {page} {AR.of} {totalPages}
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => {
                  const prevPage = page - 1;
                  setPage(prevPage);
                  loadReviews(prevPage);
                }}
                disabled={page === 1}
                className="px-3 py-1 text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {AR.previous}
              </button>
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadReviews(nextPage);
                }}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {AR.next}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-6 border-t border-gray-600">
          <div className="text-red-600 text-center">{error}</div>
        </div>
      )}
    </div>
  );
}
