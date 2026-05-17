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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://clickday.kr"),
  title: "ClickDay",
  description: "찍은 곳, 찍은 방법 - 지도 위에서 만나다. 카메라 촬영 위치, EXIF 메타데이터, 촬영 레시피를 지도 위에서 탐색하고 공유하세요.",
  keywords: ["카메라", "사진", "지도", "출사지", "촬영정보", "EXIF", "ClickDay", "클릭데이", "사진레시피"],
  authors: [{ name: "ClickDay Team" }],
  openGraph: {
    title: "ClickDay | 카메라 사진 + 지도 기반 촬영 정보 공유",
    description: "찍은 곳, 찍은 방법 - 지도 위에서 만나다. 카메라 촬영 위치, EXIF 메타데이터, 촬영 레시피를 지도 위에서 탐색하고 공유하세요.",
    url: "https://clickday.kr",
    siteName: "ClickDay",
    images: [
      {
        url: "/og-image.png",
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
    title: "ClickDay | 카메라 사진 + 지도 기반 홍보 및 촬영 정보 공유",
    description: "찍은 곳, 찍은 방법 - 지도 위에서 만나다. 카메라 촬영 위치, EXIF 메타데이터, 촬영 레시피를 지도 위에서 탐색하고 공유하세요.",
    images: ["/og-image.png"],
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
    url: "https://clickday.kr",
    description: "찍은 곳, 찍은 방법 - 지도 위에서 만나다. 카메라 촬영 위치, EXIF 메타데이터, 촬영 레시피를 지도 위에서 탐색하고 공유하세요.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://clickday.kr/feed?q={search_term_string}",
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
      <body className="min-h-full flex flex-col bg-black text-white">
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
