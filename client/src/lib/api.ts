import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// Type definitions
export interface User {
  _id: string;
  email: string;
  displayName: string;
  avatar?: string;
  phone?: string;
  location?: string;
  birthDate?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  enrolledCourses: string[];
  completedLessons: string[];
  certificates: unknown[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  emailVerified: boolean;
  subscription?: {
    type: 'free' | 'premium' | 'pro';
    expiresAt?: string;
  };
  isAdmin?: boolean;
  adminRole?: string;
  totalSpent?: number;
  notes?: string;
}

export interface Course {
  _id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    credentials?: string[];
  };
  thumbnail: string;
  price: number;
  originalPrice?: number;
  currency: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  lessons: unknown[];
  requirements?: string[];
  whatYouWillLearn: string[];
  rating: {
    average: number;
    count: number;
  };
  enrollmentCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  language: 'ar' | 'en';
  subtitles?: string[];
  certificateTemplate?: string;
  views?: number;
  completionRate?: number;
  isEnrolled?: boolean;
}

export interface Order {
  _id?: string;
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  userInfo?: {
    _id: string;
    displayName: string;
    email: string;
  };
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  courseInfo?: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  amount: number;
  currency?: string;
  originalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';
  paymentMethod: string;
  paymentIntentId?: string;
  transactionId?: string;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  processingTime?: number;
  notes?: string;
  refundReason?: string;
  isNew?: boolean;
}

export interface Certificate {
  _id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  userName: string;
  userEmail: string;
  issuedAt: string;
  verificationCode: string;
  certificateUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  courseId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  isCertified?: boolean;
  isVisible: boolean;
  helpfulVotes: number;
  totalVotes: number;
  reportedCount: number;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userAvatar?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  totalRevenue: number;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalTax: number;
  totalDiscount: number;
}

export interface DashboardStats {
  users: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    totalRevenue: number;
  };
  courses: {
    totalCourses: number;
    publishedCourses: number;
    featuredCourses: number;
    totalEnrollments: number;
    averageRating: number;
    totalRevenue: number;
  };
  orders: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalTax: number;
    totalDiscount: number;
  };
  audit: {
    totalActions: number;
    uniqueAdmins: number;
    highSeverityActions: number;
    criticalActions: number;
    unauthorizedAttempts: number;
  };
}

export interface AnalyticsData {
  period: string;
  userGrowth: unknown[];
  revenue: {
    totalRevenue?: number;
  };
  popularCourses?: Array<{
    title: string;
    revenue?: number;
    enrollmentCount?: number;
  }>;
  adminActivity?: Array<{
    action: string;
    details: unknown;
    createdAt: string;
  }>;
  weeklySalesData: Array<{
    week: string;
    sales: number;
    orders: number;
    students: number;
  }>;
  monthlyGrowthData: Array<{
    month: string;
    revenue: number;
    students: number;
    courses: number;
  }>;
  courseCompletionData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  deviceData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  quickStats: {
    conversionRate: string;
    avgSessionTime: string;
    bounceRate: string;
    newVisitors: string;
    returningVisitors: string;
    avgOrderValue: number;
  };
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

// Configure axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token: newToken, refreshToken: newRefreshToken } = response.data;

          // Update cookies
          Cookies.set('token', newToken, { expires: 7 });
          Cookies.set('refreshToken', newRefreshToken, { expires: 30 });

          // Update authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          Cookies.remove('token');
          Cookies.remove('refreshToken');
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      } else {
        // No refresh token, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Types for API responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  arabic?: string;
}

// Special response type for analytics endpoint that returns data directly
export interface AnalyticsResponse {
  success: boolean;
  analytics?: AnalyticsData;
  message?: string;
  error?: string;
  arabic?: string;
}

// Special response type for auth endpoints that return data directly
export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
  error?: string;
  arabic?: string;
}

// Special response type for /auth/me endpoint
export interface CurrentUserResponse {
  success: boolean;
  user?: User;
  error?: string;
  arabic?: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', {
      email,
      password,
    }),

  register: (userData: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
    location?: string;
    birthDate?: string;
    bio?: string;
    gender?: string;
    fitnessLevel?: string;
    goals?: string[];
  }) =>
    api.post<AuthResponse>('/auth/register', userData),

  logout: () => api.post<ApiResponse>('/auth/logout'),

  forgotPassword: (email: string) =>
    api.post<ApiResponse>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse>('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) =>
    api.post<ApiResponse>('/auth/verify-email', { token }),

  getCurrentUser: () =>
    api.get<CurrentUserResponse>('/auth/me'),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh', {
      refreshToken,
    }),
};

// User API
export const userAPI = {
  getProfile: () => api.get<{ success: boolean; user: User }>('/users/profile'),

  updateProfile: (data: {
    displayName?: string;
    phone?: string;
    location?: string;
    birthDate?: string;
    bio?: string;
    gender?: string;
    fitnessLevel?: string;
    goals?: string[];
  }) => api.put<ApiResponse<{ user: User }>>('/users/profile', data),

  getCourses: () => api.get<{ success: boolean; courses: Course[] }>('/users/courses'),

  getOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get<PaginatedResponse<Order>>('/users/orders', { params }),

  getCertificates: () => api.get<{ success: boolean; certificates: Certificate[] }>('/users/certificates'),

  getCertificate: (courseId: string) => api.get<{ success: boolean; certificate: Certificate }>(`/users/certificate/${courseId}`),

  getProgress: () => api.get<ApiResponse<{ progress: unknown[] }>>('/users/progress'),

  updateProgress: (data: {
    courseId: string;
    lessonId: string;
    watchTime: number;
    totalDuration: number;
    completed?: boolean;
    quizScore?: number;
    notes?: string;
  }) => api.post<ApiResponse<{ progress: unknown }>>('/users/progress', data),

  getStats: () => api.get<ApiResponse<{ stats: unknown }>>('/users/stats'),

  getEnrolledCourses: () => api.get<ApiResponse<{ courses: Course[] }>>('/users/enrolled-courses'),

  getUserProgress: () => api.get<ApiResponse<{ progress: unknown[] }>>('/users/dashboard-progress'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<ApiResponse>('/users/change-password', {
      currentPassword,
      newPassword,
    }),

  deleteAccount: (password: string) =>
    api.delete<ApiResponse>('/users/account', { data: { password } }),
};

// Course API
export const courseAPI = {
  getCourses: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    language?: string;
    featured?: boolean;
    search?: string;
  }) => api.get<PaginatedResponse<Course>>('/courses', { params }),

  getCourse: (id: string) => api.get<{ success: boolean; course?: Course; error?: string; arabic?: string }>(`/courses/${id}`),

  getFeatured: () => api.get<ApiResponse<{ courses: Course[] }>>('/courses/featured/list'),

  searchCourses: (query: string, params?: {
    page?: number;
    limit?: number;
  }) => api.get<PaginatedResponse<Course>>('/courses/search/query', {
    params: { q: query, ...params },
  }),

  createCourse: (data: Partial<Course>) => api.post<ApiResponse<{ course: Course }>>('/courses', data),

  updateCourse: (id: string, data: Partial<Course>) =>
    api.put<ApiResponse<{ course: Course }>>(`/courses/${id}`, data),

  deleteCourse: (id: string) => api.delete<ApiResponse>(`/courses/${id}`),

  publishCourse: (id: string, isPublished: boolean) =>
    api.patch<ApiResponse<{ course: Course }>>(`/courses/${id}/publish`, { isPublished }),

  getCourseStats: (id: string) => api.get<ApiResponse<{ stats: unknown }>>(`/courses/${id}/stats`),

  getCategories: () => api.get<ApiResponse<{ categories: string[] }>>('/courses/categories/list'),

  getStats: () => api.get<ApiResponse<{ 
    totalCourses: number; 
    totalEnrollments: number; 
    averageRating: number; 
    categories: number; 
  }>>('/courses/stats'),
};

// Reviews API
export const reviewsAPI = {
  getCourseReviews: (courseId: string, params?: {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => api.get<ApiResponse<{ reviews: Review[]; pagination: PaginationInfo }>>(`/reviews/course/${courseId}`, { params }),

  createReview: (data: {
    courseId: string;
    rating: number;
    title: string;
    comment: string;
  }) => api.post<ApiResponse<{ review: Review }>>('/reviews', data),

  updateReview: (reviewId: string, data: {
    rating?: number;
    title?: string;
    comment?: string;
  }) => api.put<ApiResponse<{ review: Review }>>(`/reviews/${reviewId}`, data),

  deleteReview: (reviewId: string) => api.delete<ApiResponse>(`/reviews/${reviewId}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get<ApiResponse<{ dashboard: DashboardStats }>>('/admin/dashboard'),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    emailVerified?: boolean;
  }) => api.get<ApiResponse<{ users: User[]; pagination: PaginationInfo; stats: UserStats }>>('/admin/users', { params }),

  getUser: (id: string) => api.get<ApiResponse<{ user: User }>>(`/admin/users/${id}`),

  updateUser: (id: string, data: {
    isActive?: boolean;
    isAdmin?: boolean;
    adminRole?: string;
    adminPermissions?: string[];
    totalSpent?: number;
    notes?: string;
  }) => api.put<ApiResponse<{ user: User }>>(`/admin/users/${id}`, data),

  updateUserNotes: (userId: string, notes: string) => 
    api.put<ApiResponse>(`/admin/users/${userId}/notes`, { notes }),

  enrollUserInCourse: (userId: string, courseId: string) => 
    api.post<ApiResponse>(`/admin/users/${userId}/enroll/${courseId}`),

  unenrollUserFromCourse: (userId: string, courseId: string) => 
    api.delete<ApiResponse>(`/admin/users/${userId}/enroll/${courseId}`),

  getCourses: (params?: {
    page?: number;
    limit?: number;
  }) => api.get<PaginatedResponse<Course>>('/admin/courses', { params }),

  getOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => api.get<ApiResponse<{ orders: Order[]; pagination: PaginationInfo; stats: OrderStats }>>('/admin/orders', { params }),

  updateOrder: (id: string, data: {
    status: string;
    notes?: string;
  }) => api.put<ApiResponse<{ order: Order }>>(`/admin/orders/${id}`, data),

  getAuditLogs: (params?: {
    page?: number;
    limit?: number;
    action?: string;
    adminEmail?: string;
    severity?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => api.get<PaginatedResponse<unknown>>('/admin/audit-logs', { params }),

  getAnalytics: (params?: {
    period?: string;
  }) => api.get<AnalyticsResponse>('/admin/analytics', { params }),
};

// Upload API
export const uploadAPI = {
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<{ file: unknown }>>('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post<ApiResponse<{ files: unknown[] }>>('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadCourseThumbnail: (file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return api.post<ApiResponse<{ thumbnail: unknown }>>('/upload/course-thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadLessonVideo: (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post<ApiResponse<{ video: unknown }>>('/upload/lesson-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes timeout for video uploads
    });
  },

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post<ApiResponse<{ avatar: unknown }>>('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteFile: (publicId: string) => api.delete<ApiResponse>(`/upload/${publicId}`),

  getUploadStats: () => api.get<ApiResponse<{ stats: unknown }>>('/upload/stats'),
};

// Utility functions
export const apiUtils = {
  handleApiError: (error: unknown) => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { arabic?: string; error?: string } } };
      if (axiosError.response?.data?.arabic) {
        return axiosError.response.data.arabic;
      }
      if (axiosError.response?.data?.error) {
        return axiosError.response.data.error;
      }
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return (error as { message: string }).message;
    }
    return 'حدث خطأ غير متوقع';
  },

  isNetworkError: (error: unknown) => {
    return error && typeof error === 'object' && !('response' in error) && 'request' in error;
  },

  isAuthError: (error: unknown) => {
    return error && typeof error === 'object' && 'response' in error && 
           (error as { response?: { status?: number } }).response?.status === 401;
  },

  isServerError: (error: unknown) => {
    return error && typeof error === 'object' && 'response' in error && 
           ((error as { response?: { status?: number } }).response?.status ?? 0) >= 500;
  },

  isClientError: (error: unknown) => {
    const status = (error && typeof error === 'object' && 'response' in error) ? 
                   (error as { response?: { status?: number } }).response?.status ?? 0 : 0;
    return status >= 400 && status < 500;
  },
};

export default api;
