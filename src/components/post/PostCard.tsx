'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Heart } from "lucide-react";
import { GeocodedAddress } from "../map/GeocodedAddress";
import { cn } from "@/lib/utils";
import { useAuth } from "../providers/AuthProvider";

interface PostCardProps {
  post: {
    id: string;
    image_url: string;
    location_name: string | null;
    like_count: number;
    user_id: string;
    latitude?: number;
    longitude?: number;
    profiles?: {
      username: string;
      avatar_url: string;
    };
  };
  isLiked: boolean;
  isBookmarked?: boolean;
}

export function PostCard({ post, isLiked, isBookmarked = false }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const imageContent = (
    <div className={cn(
      "relative overflow-hidden bg-[#222] rounded-sm border border-white/5 transition-all duration-300",
      !isImageLoaded && "aspect-[4/5] bg-white/5 animate-pulse"
    )}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={post.image_url} 
        alt={post.location_name || "Post"} 
        onLoad={() => setIsImageLoaded(true)}
        onError={() => setIsImageLoaded(true)}
        className={cn(
          "w-full h-auto transition-all duration-700 block",
          isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105 absolute inset-0"
        )}
      />
      
      {/* Overlay with minimalist stats (Likes & Location only) */}
      <div className={cn(
        "absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center z-10",
        !isImageLoaded && "hidden"
      )}>
        {/* Likes Count */}
        <div className="flex items-center gap-2 mb-3">
          <Heart size={18} className="fill-white text-white" />
          <span className="font-heading text-sm tracking-widest text-white font-bold">{post.like_count || 0}</span>
        </div>
        
        {/* Detailed Address (Geocoded) - isHovered 분기 제거하여 마우스 아웃 시 텍스트 깜빡임 원천 차단 */}
        {user && (
          <div className="flex items-center justify-center text-white/70 text-[10px] tracking-widest uppercase">
            <MapPin className="w-3 h-3 mr-1.5 text-[var(--accent)] flex-shrink-0" />
            {post.latitude && post.longitude ? (
              <GeocodedAddress 
                latitude={post.latitude} 
                longitude={post.longitude} 
                className="line-clamp-1"
                fallback={post.location_name}
              />
            ) : (
              <span className="line-clamp-1">{post.location_name}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div 
      className="group relative mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Only link to detail if logged in */}
      <div 
        className="block cursor-pointer"
        onClick={() => {
          if (user) {
            router.push(`/posts/${post.id}`);
          } else {
            router.push('/login');
          }
        }}
      >
        {imageContent}
      </div>
    </div>
  );
}
