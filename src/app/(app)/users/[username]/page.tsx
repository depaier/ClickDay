import Link from "next/link";
import { Grid, Bookmark, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MasonryGrid } from "@/components/layout/MasonryGrid";
import { PostCard } from "@/components/post/PostCard";


import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/user/FollowButton";
import { ProfileStats } from "@/components/user/ProfileStats";
import { ProfileTabs } from "@/components/user/ProfileTabs";
import { getFollowCounts, getFollowStatus } from "@/lib/actions/follow-actions";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}


export default async function UserProfilePage({ params, searchParams }: PageProps) {
  const { username: rawUsername } = await params;
  // @ 기호 처리 및 디코딩
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");
  
  const supabase = await createClient();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

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

  // Fetch posts based on active tab
  let posts: any[] = [];
  if (tab === "saved" && isOwnProfile) {
    const { data: bookmarkedData } = await supabase
      .from("bookmarks")
      .select("post_id, posts(*, profiles(username, avatar_url))")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });
    
    posts = bookmarkedData?.map(b => b.posts).filter(p => p !== null) || [];
  } else {
    const { data: ownPosts } = await supabase
      .from("posts")
      .select("*, profiles(username, avatar_url)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });
    posts = ownPosts || [];
  }



  return (
    <div>
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 pb-12 border-b border-white/10">
        {profile.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt={profile.username} 
            className="w-32 h-32 rounded-full object-cover border-2 border-white/5 shadow-xl" 
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-[#222] flex-shrink-0 border border-white/10" />
        )}
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h1 className="text-2xl font-heading tracking-widest uppercase">@{profile.username}</h1>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <Link href="/settings">
                    <Button variant="ghost" size="sm" className="h-8">Edit Profile</Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <FollowButton 
                  targetUserId={profile.id} 
                  initialIsFollowing={isFollowing} 
                />
              )}
            </div>
          </div>
          
          <ProfileStats 
            postsCount={posts?.length || 0} 
            followersCount={followersCount} 
            followingCount={followingCount} 
          />
          
          <div className="text-gray-300 text-sm max-w-md mx-auto md:mx-0">
            <p className="font-bold text-white mb-1">{profile.full_name || profile.username}</p>
            <p className="mb-2 whitespace-pre-wrap">{profile.bio || "No bio yet."}</p>
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[var(--accent)] hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ProfileTabs isOwnProfile={isOwnProfile} />

      <MasonryGrid>
        {posts?.map((post) => (
          <PostCard 
            key={post.id} 
            post={post as any} 
            isLiked={likedPostIds.has(post.id)}
            isBookmarked={bookmarkedPostIds.has(post.id)}
          />
        ))}
        {(!posts || posts.length === 0) && (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-sm">
            <p className="text-gray-500 font-heading tracking-widest uppercase">
              {tab === "saved" ? "No saved posts yet" : "No uploads yet"}
            </p>
          </div>
        )}

      </MasonryGrid>


    </div>
  );
}
