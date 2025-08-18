'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

/**
 * Footer Component - Main footer for the Arabic sports training platform
 * Features: RTL-optimized layout, social links, contact information, Arabic text support
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center ml-3">
                <span className="text-white font-bold text-xl">ط</span>
              </div>
              <span className="text-xl font-bold">طه صباغ</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              منصة تدريب رياضي عربية متخصصة في تقديم دورات تدريبية عالية الجودة للرياضيين والمدربين في جميع أنحاء الوطن العربي.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              {/* Facebook */}
              <a
                href="#"
                className="text-gray-300 hover:text-blue-500 transition-colors"
                aria-label="فيسبوك"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              
              {/* Instagram */}
              <a
                href="#"
                className="text-gray-300 hover:text-pink-500 transition-colors"
                aria-label="إنستغرام"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              
              {/* YouTube */}
              <a
                href="#"
                className="text-gray-300 hover:text-red-500 transition-colors"
                aria-label="يوتيوب"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              
              {/* TikTok */}
              <a
                href="#"
                className="text-gray-300 hover:text-black transition-colors"
                aria-label="تيك توك"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
              
              {/* WhatsApp */}
              <a
                href="#"
                className="text-gray-300 hover:text-green-500 transition-colors"
                aria-label="واتساب"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-gray-300 hover:text-white transition-colors">
                  الدورات
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">الدعم</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
              <p className="text-gray-300 text-sm">
                © {currentYear} طه صباغ. جميع الحقوق محفوظة.
              </p>
              
              {/* Payment Methods */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-gray-400 text-xs">طرق الدفع المقبولة:</span>
                
                {/* Visa */}
                <div className="bg-white rounded px-2 py-1">
                  <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
                    <rect width="40" height="24" rx="4" fill="white"/>
                    <path d="M16.283 7.5h-2.927l-1.833 9h2.927l1.833-9zm7.977 5.817c.012-2.384-3.302-2.516-3.278-3.582.008-.325.317-.671 1-.76.338-.044 1.27-.078 2.329.408l.415-1.937c-.568-.206-1.296-.404-2.204-.404-2.33 0-3.97 1.238-3.984 3.011-.015 1.311 1.171 2.043 2.064 2.478.92.448 1.229.735 1.225 1.135-.006.614-.736.885-1.418.895-1.191.019-1.883-.321-2.434-.578l-.43 2.006c.554.255 1.579.477 2.643.488 2.477 0 4.094-1.223 4.102-3.116l-.03-.044zm6.31-5.817h-2.265c-.702 0-1.227.203-1.537.946l-4.36 8.054h2.476s.405-.889.497-1.084h3.05c.071.323.289 1.084.289 1.084h2.186l-1.906-9h-.43zm-2.692 6.062c.195-.522.938-2.52.938-2.52s.192-.515.31-.849l.158.774s.447 2.15.54 2.595h-1.946zm-12.097-4.547l-2.265 6.155-.242-1.234c-.421-1.426-1.734-2.974-3.203-3.748l2.622 7.827h2.493l3.71-9h-2.493l-.622.001z" fill="#1A1F71"/>
                    <path d="M6.647 7.5H2.004l-.03.183c2.96.756 4.917 2.58 5.73 4.774L6.647 7.5z" fill="#FFBC00"/>
                  </svg>
                </div>
                
                {/* Mastercard */}
                <div className="bg-white rounded px-2 py-1">
                  <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
                    <rect width="40" height="24" rx="4" fill="white"/>
                    <circle cx="15" cy="12" r="7" fill="#EB001B"/>
                    <circle cx="25" cy="12" r="7" fill="#F79E1B"/>
                    <path d="M20 6.5c1.4 1.4 2.3 3.4 2.3 5.5s-.9 4.1-2.3 5.5c-1.4-1.4-2.3-3.4-2.3-5.5s.9-4.1 2.3-5.5z" fill="#FF5F00"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 space-x-reverse mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
                شروط الاستخدام
              </Link>
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 hover:text-white transition-all duration-200 group"
                aria-label={theme === 'light' ? 'تبديل إلى الوضع الليلي' : 'تبديل إلى الوضع النهاري'}
                title={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
              >
                {theme === 'light' ? (
                  <MoonIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                ) : (
                  <SunIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}