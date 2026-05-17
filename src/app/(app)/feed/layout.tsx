import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "피드 | ClickDay",
  description: "ClickDay에서 다양한 카메라와 렌즈로 촬영된 멋진 사진들과 지도 위치, 촬영 레시피를 실시간으로 탐색해보세요.",
  openGraph: {
    title: "피드 | ClickDay",
    description: "ClickDay에서 다양한 카메라와 렌즈로 촬영된 멋진 사진들과 지도 위치, 촬영 레시피를 실시간으로 탐색해보세요.",
    url: "https://clickday.kr/feed",
  },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
