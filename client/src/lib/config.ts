// Environment configuration
export const config = {
  // Get API URL (with /api suffix)
  get API_BASE_URL() {
    // Check if we're running on localhost (development)
    const isLocalhost = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1');
    
    // For development or localhost, use local server
    if (process.env.NODE_ENV === 'development' || isLocalhost) {
      return 'http://localhost:5050/api';
    }
    
    // For production, use environment variables with fallback to Vercel deployment
    return process.env.NEXT_PUBLIC_API_URL || 
           `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://taha-world-backend.vercel.app'}/api`;
  },
  
  // Get base URL (without /api suffix) for upload endpoints
  get BASE_URL() {
    // Check if we're running on localhost (development)
    const isLocalhost = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1');
    
    // For development or localhost, use local server
    if (process.env.NODE_ENV === 'development' || isLocalhost) {
      return 'http://localhost:5050';
    }
    
    // For production, use environment variables with fallback to Vercel deployment
    return process.env.NEXT_PUBLIC_BACKEND_URL || 
           (process.env.NEXT_PUBLIC_API_URL || 'https://taha-world-backend.vercel.app/api').replace('/api', '');
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
  },

  // Debug function to log current configuration
  debug: () => {
    if (typeof window !== 'undefined') {
      console.log('🔧 Config Debug Info:', {
        NODE_ENV: process.env.NODE_ENV,
        hostname: window.location.hostname,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
        API_BASE_URL: config.API_BASE_URL,
        BASE_URL: config.BASE_URL,
        IS_PRODUCTION: config.IS_PRODUCTION
      });
    }
  }
};

export default config;
