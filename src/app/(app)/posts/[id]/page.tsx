import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PostDetailClient } from "@/components/post/PostDetailClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return {
      title: "ClickDay",
    };
  }

  const { data: post } = await supabase
    .from("posts")
    .select("title, location_name, recipe_name, description, camera_model, image_url")
    .eq("id", id)
    .single();

  if (!post) {
    return {
      title: "ClickDay",
    };
  }

  const title = "ClickDay";
  const description = post.description || `${post.camera_model || "카메라"}로 촬영된 사진과 지도 위치, 촬영 정보를 확인해보세요.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://clickday.kr/posts/${id}`,
      images: [
        {
          url: post.image_url,
          width: 1200,
          height: 1200,
          alt: post.location_name || "ClickDay 사진",
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.image_url],
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // UUID 형식 검사 (8-4-4-4-12 hex chars)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = uuidRegex.test(id);

  if (!isUuid) {
    console.warn("Invalid UUID format:", id);
    return notFound();
  }

  // 서버에서는 오직 게시물 기본 데이터 단 1번만 초고속으로 조회하여 내려줍니다.
  // 사용자 인증(user), 좋아요(isLiked), 북마크(isBookmarked), 팔로우(isFollowing) 등 
  // 개인화된 동적 데이터는 클라이언트 컴포넌트(PostDetailClient)에서 비동기로 즉시 로드하여 
  // Vercel 배포 시 검은 화면 멈춤 현상과 라우팅 지연을 100% 원천 차단합니다!!!
  const { data: postData, error } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .eq('id', id)
    .single();

  if (error || !postData) {
    if (error) console.error("Supabase Error:", JSON.stringify(error, null, 2));
    return notFound();
  }

  const post = { 
    ...postData, 
    profiles: postData.profiles || { username: "unknown", avatar_url: null } 
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    "@id": `https://clickday.kr/posts/${id}`,
    url: `https://clickday.kr/posts/${id}`,
    headline: `${post.location_name || post.recipe_name || "사진 공유"} | ClickDay`,
    description: post.description || `${post.camera_model || "카메라"}로 촬영된 사진과 지도 위치를 확인해보세요.`,
    image: post.image_url,
    datePublished: post.created_at,
    author: {
      "@type": "Person",
      name: post.profiles?.username || "익명 사용자",
      image: post.profiles?.avatar_url,
    },
    contentLocation: post.location_name ? {
      "@type": "Place",
      name: post.location_name,
      geo: (post.latitude && post.longitude) ? {
        "@type": "GeoCoordinates",
        latitude: post.latitude,
        longitude: post.longitude,
      } : undefined,
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostDetailClient initialPost={post} />
    </>
  );
}
