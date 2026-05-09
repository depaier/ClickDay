import React from "react";
import { X, MapPin, Camera, Aperture, Clock, Hash, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../providers/AuthProvider";
import { DeletePostButton } from "./DeletePostButton";
import Link from "next/link";

interface Post {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
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
            src={post.image_url || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32"} 
            alt={post.title || "Photography"} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 space-y-8">
          {/* Photographer info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img src={post.profiles?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="avatar" />
            </div>
            <div>
              <p className="font-bold text-sm">@{post.profiles?.username || "photographer_kr"}</p>
              <p className="text-xs text-gray-500">{post.created_at ? new Date(post.created_at).toLocaleDateString() : "Recently"}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed">
            {post.description || "Beautiful sunset shot from the Seoul tower. Used my favorite Fujifilm recipe for these colors."}
          </p>

          {/* EXIF Data */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs text-gray-400 tracking-[0.167em] uppercase border-b border-gray-200 pb-2">Camera Settings</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Camera className="w-4 h-4 text-[var(--accent-dark)]" />
                <span>{post.camera_model || "Unknown Camera"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Aperture className="w-4 h-4 text-[var(--accent-dark)]" />
                <span>{post.focal_length ? `${post.focal_length}mm` : "Unknown Lens"}</span>
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
                <span className="truncate max-w-[100px]">{post.title || "Unknown Location"}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(post.tags || ["Seoul", "NightScape", "SonyAlpha"]).map((tag, idx) => (
              <span key={idx} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1">
                <Hash className="w-3 h-3 mr-1"/>{tag}
              </span>
            ))}
          </div>

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
