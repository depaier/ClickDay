import Link from "next/link";
import { Grid, Bookmark, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/user/FollowButton";
import { ProfileStats } from "@/components/user/ProfileStats";
import { ProfileTabs } from "@/components/user/ProfileTabs";
import { getFollowCounts, getFollowStatus } from "@/lib/actions/follow-actions";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
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

  const isOwnProfile = currentUser?.id === profile.id;

  // Fetch posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

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

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts?.map((post) => (
          <Link href={`/posts/${post.id}`} key={post.id} className="aspect-square bg-[#111] relative group border border-white/5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={post.image_url}
              alt={post.location_name || "User post"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <span className="font-heading tracking-widest uppercase text-sm text-white drop-shadow-md">View</span>
            </div>
          </Link>
        ))}
        {(!posts || posts.length === 0) && (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-sm">
            <p className="text-gray-500 font-heading tracking-widest uppercase">No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
