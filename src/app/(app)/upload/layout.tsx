import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사진 업로드 | ClickDay",
  description: "카메라로 촬영한 소중한 사진과 EXIF 메타데이터, 지도 위치 정보를 ClickDay에 공유하고 나만의 촬영 레시피를 기록하세요.",
  openGraph: {
    title: "사진 업로드 | ClickDay",
    description: "카메라로 촬영한 소중한 사진과 EXIF 메타데이터, 지도 위치 정보를 ClickDay에 공유하고 나만의 촬영 레시피를 기록하세요.",
    url: "https://clickday.kr/upload",
  },
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
