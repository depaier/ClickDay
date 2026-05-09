import { MapPin, Heart, Bookmark, Camera, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { DeletePostButton } from "@/components/post/DeletePostButton";
import Link from "next/link";

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
        
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="bg-black/50 border-none rounded-full w-10 h-10 backdrop-blur-md">
            <Heart className="w-5 h-5 text-white" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-black/50 border-none rounded-full w-10 h-10 backdrop-blur-md">
            <Bookmark className="w-5 h-5 text-white" />
          </Button>
        </div>
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

        {/* Action Buttons for Owner */}
        {isOwner && (
          <div className="flex gap-4 p-4 bg-white/5 rounded-sm border border-white/10">
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

        {/* Description */}
        <div>
          <h1 className="text-xl font-heading tracking-wider uppercase mb-2">
            {post.location_name || "Untitled"}
          </h1>
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
          <div className="mb-4">{post.location_name}</div>
          <div className="bg-[#222] h-[150px] flex flex-col items-center justify-center text-gray-500 border border-white/5 rounded-sm overflow-hidden">
             {/* 지도 컴포넌트 추가 가능 */}
             <div className="text-xs uppercase tracking-widest opacity-50">Map Data Available</div>
             <div className="text-[10px] font-mono mt-1 opacity-30">{post.latitude}, {post.longitude}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
