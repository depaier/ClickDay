import React from "react";
import { X, MapPin, Camera, Aperture, Clock, Hash } from "lucide-react";
import { Button } from "../ui/Button";
import Link from "next/link";
import { GeocodedAddress } from "@/components/map/GeocodedAddress";

interface Post {
  id: string | number;
  latitude: number;
  longitude: number;
  location_name: string;
  image_url?: string;
  camera_model?: string;
  aperture?: string | number;
  shutter_speed?: string;
  iso?: number;
  description?: string;
  user_id?: string;
  profile_id?: string;
  created_at?: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
  tags?: string[];
  [key: string]: any;
}

interface PostPreviewSheetProps {
  post: Post;
  onClose: () => void;
}

export function PostPreviewSheet({ post, onClose }: PostPreviewSheetProps) {
  if (!post) return null;

  return (
    <div className="absolute right-0 top-[60px] bottom-0 w-full md:w-[400px] bg-white text-black shadow-2xl z-50 transform transition-transform duration-300 translate-x-0 border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="font-heading text-lg font-bold tracking-[0.1em] uppercase">Photo Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-0">
        {/* Photo Area */}
        <div className="w-full h-[300px] bg-black flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={post.image_url} 
            alt={post.location_name || "Photography"} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 space-y-8">
          {/* Photographer info */}
          <div className="flex items-center gap-3">
            {(() => {
              const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
              return (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-800" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm">@{profile?.username || "unknown"}</p>
                    <p className="text-xs text-gray-500">{post.created_at ? new Date(post.created_at).toLocaleDateString() : "Recently"}</p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed">
            {post.description || "No description provided."}
          </p>

          {/* EXIF Data */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs text-gray-400 tracking-[0.167em] uppercase border-b border-gray-200 pb-2">Camera Settings</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Camera className="w-4 h-4 text-[var(--accent-dark)]" />
                <span className="truncate">{post.camera_model || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Aperture className="w-4 h-4 text-[var(--accent-dark)]" />
                <span>{post.focal_length ? `${post.focal_length}mm` : "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="font-bold font-mono text-[10px] w-4 text-center text-[var(--accent-dark)]">F</div>
                <span>{post.aperture ? `f/${post.aperture}` : "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-[var(--accent-dark)]" />
                <span>{post.shutter_speed || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="font-bold font-mono text-[10px] w-4 text-center text-[var(--accent-dark)]">ISO</div>
                <span>{post.iso ? `ISO ${post.iso}` : "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-[var(--accent-dark)]" />
                <GeocodedAddress 
                  latitude={post.latitude} 
                  longitude={post.longitude} 
                  className="truncate max-w-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1">
                  <Hash className="w-3 h-3 mr-1"/>{tag}
                </span>
              ))}
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="p-6 sticky bottom-0 bg-white border-t border-gray-100 space-y-3">
          <Link href={`/posts/${post.id}`}>
            <Button variant="accent" className="w-full h-12 text-sm font-heading tracking-widest uppercase">
              View Full Details
            </Button>
          </Link>
          <Button variant="ghost" className="w-full h-10 text-xs text-gray-400">Save to Bookmarks</Button>
        </div>
      </div>
    </div>
  );
}
