// Environment configuration - Updated for production fix
export const config = {
  // Get API URL (with /api suffix)
  get API_BASE_URL() {
    // Force production URL for any non-localhost domain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Only use localhost for actual localhost domains
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5050/api';
      }
      
      // For any other domain (production), force Vercel backend
      return process.env.NEXT_PUBLIC_API_URL || 'https://taha-world-backend.vercel.app/api';
    }
    
    // Server-side rendering fallback
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:5050/api';
    }
    
    // Production server-side
    return process.env.NEXT_PUBLIC_API_URL || 'https://taha-world-backend.vercel.app/api';
  },
  
  // Get base URL (without /api suffix) for upload endpoints
  get BASE_URL() {
    // Force production URL for any non-localhost domain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Only use localhost for actual localhost domains
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5050';
      }
      
      // For any other domain (production), force Vercel backend
      return process.env.NEXT_PUBLIC_BACKEND_URL || 'https://taha-world-backend.vercel.app';
    }
    
    // Server-side rendering fallback
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:5050';
    }
    
    // Production server-side
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'https://taha-world-backend.vercel.app';
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
      console.warn('🔧 TAHA WORLD CONFIG DEBUG:', {
        hostname: window.location.hostname,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
        RESOLVED_API_BASE_URL: config.API_BASE_URL,
        RESOLVED_BASE_URL: config.BASE_URL,
        IS_PRODUCTION: config.IS_PRODUCTION,
        timestamp: new Date().toISOString()
      });
      
      // Also log to console with alert styling
      console.log('%c🚨 API URL BEING USED: ' + config.API_BASE_URL, 
        'background: red; color: white; font-size: 16px; padding: 5px;');
    }
  }
};

export default config;
