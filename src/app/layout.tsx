import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "ClickDay | 카메라 사진 + 지도 기반 촬영 정보 공유",
  description: "찍은 곳, 찍은 방법 - 지도 위에서 만나다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
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
