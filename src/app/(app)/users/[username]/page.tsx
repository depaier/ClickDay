import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { getFollowCounts, getFollowStatus } from "@/lib/actions/follow-actions";
import { ProfileClient } from "@/components/user/ProfileClient";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
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

  return (
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
  );
}
