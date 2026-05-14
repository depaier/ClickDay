import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PostDetailClient } from "@/components/post/PostDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
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

  return (
    <PostDetailClient 
      post={post}
      user={user}
      isOwner={isOwner}
      isLiked={isLiked}
      isBookmarked={isBookmarked}
      isFollowing={isFollowing}
    />
  );
}
