import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CustomAlert } from "@/components/ui/CustomAlert";
import { Toast } from "@/components/ui/Toast";
import { PageTransition } from "@/components/layout/PageTransition";
import { OnboardingGuard } from "@/components/auth/OnboardingGuard";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://clickday.me"),
  title: "ClickDay | 클릭데이",
  description: "촬영 위치, EXIF 데이터, 카메라 설정까지. 사진의 모든 정보를 지도 위에서 공유하세요.",
  keywords: ["ClickDay", "클릭데이", "카메라", "사진", "지도", "출사지", "촬영정보", "EXIF", "사진레시피"],
  authors: [{ name: "ClickDay Team" }],
  openGraph: {
    title: "ClickDay | 클릭데이",
    description: "촬영 위치, EXIF 데이터, 카메라 설정까지. 사진의 모든 정보를 지도 위에서 공유하세요.",
    url: "https://clickday.me",
    siteName: "ClickDay",
    images: [
      {
        url: "https://clickday.me/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClickDay 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClickDay | 클릭데이",
    description: "촬영 위치, EXIF 데이터, 카메라 설정까지. 사진의 모든 정보를 지도 위에서 공유하세요.",
    images: ["https://clickday.me/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ClickDay",
    alternateName: ["클릭데이", "Click Day"],
    url: "https://clickday.me",
    description: "촬영 위치, EXIF 데이터, 카메라 설정까지. 사진의 모든 정보를 지도 위에서 공유하세요.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://clickday.me/feed?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="ko" suppressHydrationWarning className={`${outfit.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <AuthProvider>
          <LanguageProvider>
            <PageTransition>
              <OnboardingGuard>
                {children}
              </OnboardingGuard>
            </PageTransition>
            <CustomAlert />
            <Toast />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
