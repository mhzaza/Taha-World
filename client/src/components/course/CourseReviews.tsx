'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StarIcon, StarIcon as StarOutlineIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
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

export default function CourseReviews({ courseId, isEnrolled }: CourseReviewsProps) {
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

  const loadReviews = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(`${backendUrl}/api/reviews/course/${courseId}?page=${pageNum}&limit=5`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newReviews = data.reviews || [];
          setReviews(append ? [...reviews, ...newReviews] : newReviews);
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
  };

  useEffect(() => {
    loadReviews();
  }, [courseId, user]);

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
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            {star <= rating ? (
              <StarIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarOutline className="w-5 h-5 text-gray-300" />
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
      <div className="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-600">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-600 pb-4">
                <div className="flex items-center space-x-3 space-x-reverse mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-600">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{AR.reviews}</h3>
        {user && !userReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {AR.writeReview}
          </button>
        )}
      </div>

      {/* Rating Stats */}
      {ratingStats && ratingStats.totalReviews > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{ratingStats.averageRating}</div>
              <div className="text-sm text-gray-400">{AR.averageRating}</div>
              {renderStars(ratingStats.averageRating)}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{ratingStats.totalReviews}</div>
              <div className="text-sm text-gray-400">{AR.totalReviews}</div>
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingStats.ratingDistribution[rating as keyof typeof ratingStats.ratingDistribution];
              const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3 space-x-reverse">
                  <span className="text-sm w-8">{rating}</span>
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold mb-4 text-black">
            {editingReview ? AR.editReview : AR.writeReview}
          </h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {AR.rating}
              </label>
              {renderStars(formData.rating, true, (rating) => 
                setFormData(prev => ({ ...prev, rating }))
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {AR.title}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={AR.reviewTitlePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {AR.comment}
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder={AR.reviewCommentPlaceholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500"
                required
              />
            </div>
            
            <div className="flex space-x-3 space-x-reverse">
              <button
                type="submit"
                disabled={submitting || formData.rating === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {AR.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">{AR.noReviews}</div>
          <div className="text-gray-400">{AR.beFirst}</div>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-600 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {review.userId.displayName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{review.userId.displayName}</div>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                      {renderStars(review.rating)}
                      <span>•</span>
                      <span>{formatDate(review.createdAt)}</span>
                      {review.isVerified && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium">{AR.verified}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {user && user._id === review.userId._id && (
                  <div className="flex space-x-2 space-x-reverse">
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
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {AR.editReview}
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      {AR.deleteReview}
                    </button>
                  </div>
                )}
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              <p className="text-gray-200 leading-relaxed mb-3">{review.comment}</p>
              
              {review.totalVotes > 0 && (
                <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                  <span>{review.helpfulVotes} من {review.totalVotes} وجدوا هذا مفيداً</span>
                  <span>({review.helpfulPercentage}%)</span>
                </div>
              )}
              
              {user && user._id !== review.userId._id && (
                <div className="flex space-x-2 space-x-reverse mt-3">
                  <button
                    onClick={() => handleVote(review._id, true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {AR.helpful}
                  </button>
                  <button
                    onClick={() => handleVote(review._id, false)}
                    className="text-sm text-gray-400 hover:text-gray-200"
                  >
                    {AR.notHelpful}
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadReviews(nextPage, true);
                }}
                className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {AR.showMore}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
