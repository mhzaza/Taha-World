import { NextRequest } from 'next/server';

/**
 * Get client IP address from NextRequest
 * @param request NextRequest object
 * @returns IP address as string
 */
export function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to unknown if no IP found
  return 'unknown';
}

/**
 * Format currency amount
 * @param amount Amount in cents/smallest unit
 * @param currency Currency code (USD, SAR, EGP)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatters = {
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    SAR: new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }),
    EGP: new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' })
  };
  
  const formatter = formatters[currency as keyof typeof formatters] || formatters.USD;
  return formatter.format(amount / 100); // Convert from cents to main unit
}

/**
 * Format date for Arabic locale
 * @param date Date object or string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Validate email format
 * @param email Email string
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate random string
 * @param length Length of the string
 * @returns Random string
 */
export function generateRandomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sanitize string for safe usage
 * @param str Input string
 * @returns Sanitized string
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>"'&]/g, (match) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return entities[match];
  });
}