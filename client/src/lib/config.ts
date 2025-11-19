// Environment configuration
export const config = {
  // API Base URL - should be set in Vercel environment variables
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api',
  
  // Get base URL without /api suffix for upload endpoints
  get BASE_URL() {
    return this.API_BASE_URL.replace('/api', '');
  },
  
  // Check if we're in production
  get IS_PRODUCTION() {
    return process.env.NODE_ENV === 'production';
  },
  
  // Get the correct backend URL for different use cases
  getBackendUrl: (includeApi: boolean = true) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
    return includeApi ? baseUrl : baseUrl.replace('/api', '');
  }
};

export default config;
