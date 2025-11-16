'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

interface Review {
  _id: string;
  userId: {
    _id: string;
    displayName: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  helpfulVotes: number;
  totalVotes: number;
  helpfulPercentage: number;
  createdAt: string;
}

interface RatingStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface CourseReviewsProps {
  courseId: string;
  isEnrolled: boolean;
  courseRating?: { average: number; count: number };
  onReviewChange?: () => void | Promise<void>;
}

const AR = {
  reviews: 'التقييمات',
  writeReview: 'اكتب تقييمك',
  rating: 'التقييم',
  title: 'عنوان التقييم',
  comment: 'تعليقك',
  submit: 'إرسال التقييم',
  cancel: 'إلغاء',
  helpful: 'مفيد',
  notHelpful: 'غير مفيد',
  verified: 'مُتحقق',
  verifiedPurchase: 'مُتحقق من الشراء',
  noReviews: 'لا توجد تقييمات بعد',
  beFirst: 'كن أول من يقيم هذه الدورة',
  averageRating: 'متوسط التقييم',
  totalReviews: 'إجمالي التقييمات',
  ratingDistribution: 'توزيع التقييمات',
  stars: 'نجمة',
  starsPlural: 'نجمات',
  loading: 'جاري التحميل...',
  error: 'حدث خطأ',
  retry: 'إعادة المحاولة',
  reviewSubmitted: 'تم إرسال التقييم بنجاح',
  reviewDeleted: 'تم حذف التقييم بنجاح',
  voteRecorded: 'تم تسجيل التصويت',
  loginToReview: 'سجل الدخول لإضافة تقييم',
  loginToVote: 'سجل الدخول للتصويت',
  alreadyReviewed: 'لقد قمت بتقييم هذه الدورة من قبل',
  reviewTitlePlaceholder: 'اكتب عنواناً مختصراً لتقييمك...',
  reviewCommentPlaceholder: 'شاركنا تجربتك مع هذه الدورة...',
  showMore: 'عرض المزيد',
  showLess: 'عرض أقل',
  editReview: 'تعديل التقييم',
  deleteReview: 'حذف التقييم',
  confirmDelete: 'هل أنت متأكد من حذف هذا التقييم؟',
  yes: 'نعم',
  no: 'لا',
};

export default function CourseReviews({ courseId, onReviewChange }: CourseReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Review form state
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: ''
  });

  const loadReviews = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(`${backendUrl}/api/reviews/course/${courseId}?page=${pageNum}&limit=5`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newReviews = data.reviews || [];
          setReviews(prevReviews => append ? [...prevReviews, ...newReviews] : newReviews);
          setRatingStats(data.ratingStats);
          setHasMore(data.pagination.hasNextPage);
          
          // Check if user has already reviewed
          if (user) {
            const existingReview = newReviews.find((review: Review) => 
              review.userId._id === user._id
            );
            setUserReview(existingReview || null);
          }
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
  }, [courseId, user]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      setError(null);

      const token = Cookies.get('token');
      if (!token) {
        setError(AR.loginToReview);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const url = editingReview 
        ? `${backendUrl}/api/reviews/${editingReview._id}`
        : `${backendUrl}/api/reviews`;
      
      const method = editingReview ? 'PUT' : 'POST';

      const requestBody = {
        courseId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
      };
      
      console.log('Submitting review:', requestBody);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowReviewForm(false);
          setEditingReview(null);
          setFormData({ rating: 0, title: '', comment: '' });
          await loadReviews(); // Reload reviews
          if (onReviewChange) {
            await onReviewChange(); // Notify parent component
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Review submission error:', errorData);
        setError(errorData.arabic || errorData.error || AR.error);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(AR.error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user || !confirm(AR.confirmDelete)) return;

    try {
      const token = Cookies.get('token');
      if (!token) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(`${backendUrl}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadReviews(); // Reload reviews
        if (onReviewChange) {
          await onReviewChange(); // Notify parent component
        }
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const handleVote = async (reviewId: string, helpful: boolean) => {
    if (!user) {
      alert(AR.loginToVote);
      return;
    }

    try {
      const token = Cookies.get('token');
      if (!token) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(`${backendUrl}/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ helpful }),
      });

      if (response.ok) {
        await loadReviews(); // Reload reviews to update vote counts
      }
    } catch (err) {
      console.error('Error voting on review:', err);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1 space-x-reverse">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-125 active:scale-95' : 'cursor-default'} transition-all duration-150 ease-out`}
          >
            {star <= rating ? (
              <StarIcon className={`${interactive ? 'w-8 h-8' : 'w-6 h-6'} text-yellow-400 drop-shadow-sm`} />
            ) : (
              <StarOutline className={`${interactive ? 'w-8 h-8' : 'w-6 h-6'} text-gray-300`} />
            )}
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 space-x-reverse mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-2 h-10 bg-gradient-to-b from-[#41ADE1] to-indigo-600 rounded-full"></div>
          <h3 className="text-3xl font-bold text-gray-900">{AR.reviews}</h3>
        </div>
        {user && !userReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-gradient-to-r from-[#41ADE1] to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-[#3399CC] hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold"
          >
            {AR.writeReview}
          </button>
        )}
      </div>

      {/* Rating Stats */}
      {ratingStats && ratingStats.totalReviews > 0 && (
        <div className="mb-8 bg-gradient-to-br from-[#41ADE1]/20 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-[#41ADE1]/30 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Average Rating */}
            <div className="text-center bg-white rounded-xl p-6 shadow-sm">
              <div className="text-6xl font-bold bg-gradient-to-r from-[#41ADE1] to-indigo-600 bg-clip-text text-transparent mb-2">
                {ratingStats.averageRating.toFixed(1)}
              </div>
              <div className="mb-3">{renderStars(ratingStats.averageRating)}</div>
              <div className="text-sm font-medium text-gray-600">{AR.averageRating}</div>
            </div>
            
            {/* Total Reviews */}
            <div className="text-center bg-white rounded-xl p-6 shadow-sm">
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {ratingStats.totalReviews}
              </div>
              <div className="text-sm font-medium text-gray-600">{AR.totalReviews}</div>
              <div className="mt-3 text-xs text-gray-500">
                {ratingStats.totalReviews === 1 ? 'تقييم واحد' : `${ratingStats.totalReviews} تقييمات`}
              </div>
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">{AR.ratingDistribution}</h4>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingStats.ratingDistribution[rating as keyof typeof ratingStats.ratingDistribution];
                const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-3 space-x-reverse group">
                    <span className="text-sm font-semibold text-gray-700 w-8">{rating}</span>
                    <StarIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1 bg-gray-400 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-amber-500 h-3 rounded-full transition-all duration-500 ease-out group-hover:from-yellow-500 group-hover:to-amber-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-left">{count}</span>
                    <span className="text-xs text-gray-500 w-12">({percentage.toFixed(0)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 bg-gradient-to-br from-[#41ADE1]/20 to-indigo-50 rounded-2xl p-8 border border-[#41ADE1]/40 shadow-md">
          <h4 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
            <PencilSquareIcon className="w-7 h-7 ml-3 text-[#41ADE1]" />
            {editingReview ? AR.editReview : AR.writeReview}
          </h4>
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {AR.rating}
              </label>
              {renderStars(formData.rating, true, (rating) => 
                setFormData(prev => ({ ...prev, rating }))
              )}
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {AR.title}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={AR.reviewTitlePlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                required
              />
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {AR.comment}
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder={AR.reviewCommentPlaceholder}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent text-gray-900 placeholder-gray-400 transition-all resize-none"
                required
              />
            </div>
            
            <div className="flex space-x-3 space-x-reverse pt-2">
              <button
                type="submit"
                disabled={submitting || formData.rating === 0}
                className="flex-1 bg-gradient-to-r from-[#41ADE1] to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-[#3399CC] hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold"
              >
                {submitting ? AR.loading : AR.submit}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setFormData({ rating: 0, title: '', comment: '' });
                }}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-100 transition-all border border-gray-300 font-semibold"
              >
                {AR.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 ml-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="mb-4">
            <svg className="mx-auto w-16 h-16 !text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <div className="!text-black text-xl font-semibold mb-2">{AR.noReviews}</div>
          <div className="!text-black">{AR.beFirst}</div>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review._id} className="bg-[#11192a] rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 space-x-reverse flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#41ADE1]/200 to-indigo-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-white font-bold text-xl">
                      {review.userId.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                      <div className="font-bold text-gray-900 text-lg pl-2">{review.userId.displayName}</div>
                      {review.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          {AR.verified}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm mb-2">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                {user && user._id === review.userId._id && (
                  <div className="flex space-x-2 space-x-reverse mr-2">
                    <button
                      onClick={() => {
                        setEditingReview(review);
                        setFormData({
                          rating: review.rating,
                          title: review.title,
                          comment: review.comment
                        });
                        setShowReviewForm(true);
                      }}
                      className="p-2 text-[#41ADE1] hover:bg-[#41ADE1]/20 rounded-lg transition-colors group"
                      title={AR.editReview}
                    >
                      <PencilSquareIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                      title={AR.deleteReview}
                    >
                      <TrashIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
              
              <h4 className="font-bold text-gray-900 mb-3 text-lg">{review.title}</h4>
              <p className="text-gray-700 leading-relaxed mb-4 text-base">{review.comment}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                {review.totalVotes > 0 && (
                  <div className="flex items-center space-x-2 space-x-reverse text-sm">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="text-gray-600 font-medium">
                      {review.helpfulVotes} من {review.totalVotes} وجدوا هذا مفيداً
                    </span>
                    <span className="text-gray-500">({review.helpfulPercentage}%)</span>
                  </div>
                )}
                
                {user && user._id !== review.userId._id && (
                  <div className="flex space-x-3 space-x-reverse">
                    <button
                      onClick={() => handleVote(review._id, true)}
                      className="inline-flex items-center px-4 py-2 ml-2 bg-[#41ADE1]/20 text-[#3399CC] rounded-lg hover:bg-[#41ADE1]/30 transition-colors text-sm font-medium"
                      style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                    >
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {AR.helpful}
                    </button>
                    <button
                      onClick={() => handleVote(review._id, false)}
                      className="inline-flex items-center px-4 py-2 bg-gray-400 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4 ml-1 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {AR.notHelpful}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadReviews(nextPage, true);
                }}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm hover:shadow-md font-semibold"
              >
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {AR.showMore}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
