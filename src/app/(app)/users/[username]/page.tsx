import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { getFollowCounts, getFollowStatus } from "@/lib/actions/follow-actions";
import { ProfileClient } from "@/components/user/ProfileClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");

  if (username === "undefined") {
    return { title: "ClickDay" };
  }

  const supabase = await createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(username);

  const query = supabase.from("profiles").select("username, bio, avatar_url");
  if (isUuid) {
    query.eq("id", username);
  } else {
    query.eq("username", username);
  }

  const { data: profile } = await query.single();

  if (!profile) {
    return { title: "ClickDay" };
  }

  const title = "ClickDay";
  const description = profile.bio || `${profile.username}님의 ClickDay 프로필입니다. 카메라로 촬영한 멋진 사진과 위치를 확인해보세요.`;
  const image = profile.avatar_url || "/og-image.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://clickday.me/users/${profile.username}`,
      images: [
        {
          url: image,
          width: 800,
          height: 800,
          alt: `${profile.username}님의 프로필 사진`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function UserProfilePage({ params, searchParams }: PageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");
  
  if (username === "undefined") {
    return notFound();
  }
  
  const supabase = await createClient();

  // Fetch profile by username or ID (as fallback)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(username);
  
  const query = supabase
    .from("profiles")
    .select("*");
    
  if (isUuid) {
    query.eq("id", username);
  } else {
    query.eq("username", username);
  }

  const { data: profile, error: profileError } = await query.single();

  if (profileError || !profile) {
    console.error("Profile not found:", username, profileError);
    return notFound();
  }

  // Fetch follow data and current user in parallel
  const [
    { followersCount, followingCount }, 
    isFollowing, 
    { data: { user: currentUser } }
  ] = await Promise.all([
    getFollowCounts(profile.id),
    getFollowStatus(profile.id),
    supabase.auth.getUser()
  ]);

  const { tab = "posts" } = await searchParams;
  const isOwnProfile = currentUser?.id === profile.id;

  // Fetch current user's likes and bookmarks for these posts if logged in
  let likedPostIds = new Set<string>();
  let bookmarkedPostIds = new Set<string>();
  
  if (currentUser) {
    const [likes, bookmarks] = await Promise.all([
      supabase.from("likes").select("post_id").eq("user_id", currentUser.id),
      supabase.from("bookmarks").select("post_id").eq("user_id", currentUser.id)
    ]);
    
    if (likes.data) likedPostIds = new Set(likes.data.map(l => l.post_id));
    if (bookmarks.data) bookmarkedPostIds = new Set(bookmarks.data.map(b => b.post_id));
  }

  // Fetch all own posts (for the count and for the default tab)
  const { data: ownPostsData } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const ownPosts = ownPostsData || [];
  const ownPostsCount = ownPosts.length;

  // Determine which posts to display based on active tab
  let displayPosts: any[] = [];
  if (tab === "saved" && isOwnProfile) {
    const { data: bookmarkedData } = await supabase
      .from("bookmarks")
      .select("post_id, posts(*, profiles(username, avatar_url))")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });
    
    displayPosts = bookmarkedData?.map(b => b.posts).filter(p => p !== null) || [];
  } else {
    displayPosts = ownPosts;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `https://clickday.kr/users/${profile.username}`,
    url: `https://clickday.kr/users/${profile.username}`,
    mainEntity: {
      "@type": "Person",
      name: profile.username,
      description: profile.bio || `${profile.username}님의 ClickDay 프로필`,
      image: profile.avatar_url || "https://clickday.kr/og-image.png",
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/FollowAction",
          userInteractionCount: followersCount,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileClient 
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        followersCount={followersCount}
        followingCount={followingCount}
        ownPostsCount={ownPostsCount}
        displayPosts={displayPosts}
        likedPostIds={likedPostIds}
        bookmarkedPostIds={bookmarkedPostIds}
        tab={tab}
      />
    </>
  );
}
