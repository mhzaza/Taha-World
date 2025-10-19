import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Script from 'next/script';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import ClientAuthProvider from "@/components/ClientAuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "طه صباغ - منصة التدريب الرياضي",
  description: "منصة تدريب رياضي عربية متخصصة في تقديم دورات تدريبية عالية الجودة",
  keywords: "تدريب رياضي, دورات رياضية, طه صباغ, تدريب عربي",
  authors: [{ name: "طه صباغ" }],
  openGraph: {
    title: "طه صباغ - منصة التدريب الرياضي",
    description: "منصة تدريب رياضي عربية متخصصة في تقديم دورات تدريبية عالية الجودة",
    type: "website",
    locale: "ar_SA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${ibmPlexArabic.variable} antialiased font-sans`}
      >
        <ThemeProvider>
          <ClientAuthProvider>
            {children}
            <Toaster position="top-center" reverseOrder={false} />
            <Suspense fallback={null}>
              <GoogleAnalytics />
            </Suspense>
          </ClientAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
