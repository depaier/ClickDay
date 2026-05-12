"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Heart } from "lucide-react";
import { LikeButton } from "./LikeButton";
import { BookmarkButton } from "./BookmarkButton";
import { GeocodedAddress } from "../map/GeocodedAddress";
import { cn } from "@/lib/utils";
import { useAuth } from "../providers/AuthProvider";
import { PostActions } from "./PostActions";

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
  const isOwner = user?.id === post.user_id;

  return (
    <div 
      className="group relative mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/posts/${post.id}`} className="block cursor-pointer">
        <div className="relative overflow-hidden bg-[#222] rounded-sm border border-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={post.image_url} 
            alt={post.location_name || "Post"} 
            className="w-full h-auto group-hover:scale-105 transition-transform duration-500 block"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
            {/* Photographer Link */}
            {post.profiles && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/users/@${post.profiles?.username}`);
                }}
                className="mb-4 flex flex-col items-center group/user"
              >
                <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden mb-2 group-hover/user:border-[var(--accent)] transition-colors">
                  <img src={post.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles.username}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-heading tracking-widest uppercase group-hover/user:text-[var(--accent)] transition-colors">
                  {post.profiles.username}
                </span>
              </button>
            )}

            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1.5">
                <Heart size={18} className="fill-white text-white" />
                <span className="font-heading text-sm tracking-widest">{post.like_count || 0}</span>
              </div>
            </div>
            
            {post.location_name && (
              <h3 className="font-heading tracking-[0.2em] uppercase text-[10px] text-white/90 line-clamp-1 mb-1">
                {post.location_name}
              </h3>
            )}
            
            <div className="flex items-center text-white/60 text-[9px] tracking-wider uppercase">
              <MapPin className="w-3 h-3 mr-1 text-[var(--accent)]" />
              {/* @ts-ignore - post might not have lat/lng but GeocodedAddress handles it */}
              {(post.latitude && post.longitude && isHovered) ? (
                <GeocodedAddress 
                  latitude={post.latitude} 
                  longitude={post.longitude} 
                  className="line-clamp-1"
                  fallback={post.location_name}
                />
              ) : (
                post.location_name
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Overlay Actions (Visible on hover or mobile) */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <LikeButton 
          postId={post.id} 
          initialLikeCount={post.like_count} 
          initialIsLiked={isLiked}
          className="bg-black/50 backdrop-blur-md border-white/5"
        />
        <BookmarkButton
          postId={post.id}
          initialIsBookmarked={isBookmarked}
          className="bg-black/50 backdrop-blur-md border-white/5"
        />
        {isOwner && (
          <PostActions 
            postId={post.id} 
            imageUrl={post.image_url} 
            className="bg-black/50 backdrop-blur-md border-white/5 rounded-full"
            iconClassName="text-white"
          />
        )}
      </div>
    </div>
  );
}
