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
      title: "페이지를 찾을 수 없습니다 | ClickDay",
    };
  }

  const { data: post } = await supabase
    .from("posts")
    .select("location_name, recipe_name, description, camera_model, image_url")
    .eq("id", id)
    .single();

  if (!post) {
    return {
      title: "게시물을 찾을 수 없습니다 | ClickDay",
    };
  }

  const title = `${post.location_name || post.recipe_name || "사진 공유"} | ClickDay`;
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

  // 비로그인 사용자는 상세 페이지에 접근 불가 → 로그인 페이지로 리다이렉트
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?returnTo=/posts/${id}`);
  }

  const { data: postData, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !postData) {
    if (error) console.error("Supabase Error:", JSON.stringify(error, null, 2));
    return notFound();
  }

  // 별도로 profile 가져오기
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', postData.user_id || postData.profile_id) 
    .single();
  
  const post = { ...postData, profiles: profile };
  const isOwner = user.id === post.user_id;

  let isLiked = false;
  let isBookmarked = false;
  let isFollowing = false;

  const { data: likeData } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  isLiked = !!likeData;

  const { data: bookmarkData } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('post_id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  isBookmarked = !!bookmarkData;

  if (post.user_id && post.user_id !== user.id) {
    const { data: followData } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', post.user_id)
      .maybeSingle();
    isFollowing = !!followData;
  }

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
      name: profile?.username || "익명 사용자",
      image: profile?.avatar_url,
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
      <PostDetailClient 
        post={post}
        user={user}
        isOwner={isOwner}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        isFollowing={isFollowing}
      />
    </>
  );
}
