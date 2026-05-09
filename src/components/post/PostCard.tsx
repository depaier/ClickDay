"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { LikeButton } from "./LikeButton";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    image_url: string;
    location_name: string | null;
    like_count: number;
    user_id: string;
  };
  isLiked: boolean;
}

export function PostCard({ post, isLiked }: PostCardProps) {
  return (
    <div className="group relative">
      <Link href={`/posts/${post.id}`} className="block cursor-pointer">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#222] rounded-sm border border-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={post.image_url} 
            alt={post.location_name || "Post"} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
            <h3 className="font-heading tracking-wider uppercase text-lg text-white">
              {post.location_name || "Untitled"}
            </h3>
            <div className="flex items-center text-gray-300 text-sm mt-2">
              <MapPin className="w-4 h-4 mr-1 text-[var(--accent)]" />
              {post.location_name}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Overlay Actions (Visible on hover or mobile) */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <LikeButton 
          postId={post.id} 
          initialLikeCount={post.like_count} 
          initialIsLiked={isLiked}
          className="bg-black/50 backdrop-blur-md"
        />
      </div>
    </div>
  );
}
