// Environment configuration
export const config = {
  // Get API URL (with /api suffix)
  get API_BASE_URL() {
    // For development, always use localhost to avoid CORS issues
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:5050/api';
    }
    // For production, use environment variables
    return process.env.NEXT_PUBLIC_API_URL || 
           `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'}/api`;
  },
  
  // Get base URL (without /api suffix) for upload endpoints
  get BASE_URL() {
    // For development, always use localhost to avoid CORS issues
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:5050';
    }
    // For production, use environment variables
    return process.env.NEXT_PUBLIC_BACKEND_URL || 
           (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api').replace('/api', '');
  },
  
  // Check if we're in production
  get IS_PRODUCTION() {
    return process.env.NODE_ENV === 'production';
  },
  
  // Get the correct backend URL for different use cases
  getBackendUrl: (includeApi: boolean = true) => {
    if (includeApi) {
      return config.API_BASE_URL;
    } else {
      return config.BASE_URL;
    }
  }
};

export default config;
