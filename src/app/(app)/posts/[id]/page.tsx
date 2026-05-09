import { MapPin, Heart, Bookmark, Camera, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { DeletePostButton } from "@/components/post/DeletePostButton";
import { LikeButton } from "@/components/post/LikeButton";
import { BookmarkButton } from "@/components/post/BookmarkButton";
import Link from "next/link";
import { PostDetailMap } from "@/components/map/PostDetailMap";

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
    .eq('id', postData.user_id || postData.profile_id) // 컬럼명 불확실성 대응
    .single();
  
  const post = { ...postData, profiles: profile };

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === post.user_id;

  let isLiked = false;
  let isBookmarked = false;
  if (user) {
    const { data: likeData } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    isLiked = !!likeData;

    // Check if user bookmarked the post
    const { data: bookmarkData } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    isBookmarked = !!bookmarkData;
  }

  console.log("SERVER SIDE DEBUG:");
  console.log("- User from Auth:", user?.id);
  console.log("- Post Owner ID:", post.user_id);
  console.log("- Is Owner?", isOwner);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
      {/* Image Section */}
      <div className="bg-[#111] flex items-center justify-center min-h-[60vh] lg:min-h-[80vh] p-4 relative group rounded-sm border border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={post.image_url} 
          alt={post.location_name || "Post detail"} 
          className="max-w-full max-h-[80vh] object-contain"
        />
        
        {/* Buttons removed from here */}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-8">
        {/* User Info & Actions */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-800" />
            )}
            <div>
              <div className="font-heading tracking-wider uppercase text-sm">
                @{post.profiles?.username || "unknown"}
              </div>
              <div className="text-gray-500 text-xs">
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isOwner && <Button variant="ghost" size="sm" className="text-xs h-8">Follow</Button>}
          </div>
        </div>


        {/* Description */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-xl font-heading tracking-wider uppercase">
              {post.location_name || "Untitled"}
            </h1>
            <div className="flex gap-2">
              <LikeButton 
                postId={id} 
                initialLikeCount={post.like_count || 0} 
                initialIsLiked={isLiked}
                variant="ghost"
                size="default"
                showCount
                className="bg-white/5 border-white/10 px-4 py-1 h-10 rounded-full"
              />
              <BookmarkButton
                postId={id}
                initialIsBookmarked={isBookmarked}
                variant="ghost"
                size="icon"
                className="bg-white/5 border-white/10 rounded-full w-10 h-10"
                iconClassName="text-white"
              />
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {post.description || "No description provided."}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 text-sm text-[var(--accent)] font-mono flex-wrap">
              {post.tags.map((tag: string) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Exif Info */}
        <div className="bg-[#111] p-6 space-y-4 text-sm border border-white/5 rounded-sm">
          <h3 className="font-heading tracking-wider uppercase flex items-center mb-4 text-[var(--accent)] text-xs">
            <Camera className="w-4 h-4 mr-2" />
            EXIF Data
          </h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Camera</div>
              <div>{post.camera_model || "Unknown"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Aperture</div>
              <div>{post.aperture ? `f/${post.aperture}` : "Unknown"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Shutter</div>
              <div>{post.shutter_speed || "Unknown"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">ISO</div>
              <div>{post.iso ? `ISO ${post.iso}` : "Unknown"}</div>
            </div>
            {post.focal_length && (
              <div>
                <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Focal Length</div>
                <div>{post.focal_length}mm</div>
              </div>
            )}
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-[#111] p-6 text-sm border border-white/5 rounded-sm">
          <h3 className="font-heading tracking-wider uppercase flex items-center mb-4 text-[var(--accent)] text-xs">
            <MapPin className="w-4 h-4 mr-2" />
            Location
          </h3>
          <div className="h-[250px] overflow-hidden">
             <PostDetailMap latitude={post.latitude} longitude={post.longitude} />
          </div>
        </div>

        {/* Action Buttons for Owner */}
        {isOwner && (
          <div className="flex gap-4 p-4 bg-white/5 rounded-sm border border-white/10 mt-auto">
            <Link href={`/posts/${id}/edit`} className="flex-1">
              <Button variant="accent" className="w-full h-12 flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" /> Edit Post
              </Button>
            </Link>
            <div className="flex-1">
              <DeletePostButton postId={id} imageUrl={post.image_url} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
