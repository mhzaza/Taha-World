'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: url,
    });
  }
};

export const GoogleAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const url = pathname + searchParams.toString();
      pageview(url);
    }
  }, [pathname, searchParams]);

  return null;
};