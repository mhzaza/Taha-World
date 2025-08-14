import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

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
      <body
        className={`${ibmPlexArabic.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
