"use client";

import React from "react";
import { MapPin, Heart, Bookmark, Camera, Edit, Clock, Aperture, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DeletePostButton } from "@/components/post/DeletePostButton";
import { LikeButton } from "@/components/post/LikeButton";
import { BookmarkButton } from "@/components/post/BookmarkButton";
import { FollowButton } from "@/components/user/FollowButton";
import Link from "next/link";
import { PostDetailMap } from "@/components/map/PostDetailMap";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { motion } from "framer-motion";
import { PostActions } from "@/components/post/PostActions";

interface PostDetailClientProps {
  post: any;
  user: any;
  isOwner: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  isFollowing: boolean;
}

export function PostDetailClient({ 
  post, 
  user, 
  isOwner, 
  isLiked, 
  isBookmarked, 
  isFollowing 
}: PostDetailClientProps) {
  const { language } = useLanguage();
  const t = translations[language].post;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start"
    >
      {/* Image Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="bg-[#111] flex items-center justify-center min-h-[60vh] lg:min-h-[80vh] p-4 relative group rounded-sm border border-white/5 overflow-hidden shadow-2xl"
      >
        <img 
          src={post.image_url} 
          alt={post.location_name || "Post detail"} 
          className="max-w-full max-h-[80vh] object-contain transition-transform duration-700 hover:scale-[1.02]"
        />
        
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
           <Maximize2 className="text-white/50 w-12 h-12" />
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex flex-col gap-8"
      >
        {/* User Info & Actions */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <Link href={`/users/@${post.profiles?.username}`} className="group flex items-center gap-3">
              {post.profiles?.avatar_url ? (
                <img src={post.profiles.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-[var(--accent)] transition-colors" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 group-hover:border-[var(--accent)] transition-colors" />
              )}
              <div>
                <div className="font-bold text-sm group-hover:text-[var(--accent)] transition-colors">
                  {post.profiles?.username || "unknown"}
                </div>
                <div className="text-gray-500 text-xs" suppressHydrationWarning>
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          </div>
          
          <div className="flex gap-2">
            {!isOwner && post.user_id && (
              <FollowButton 
                targetUserId={post.user_id} 
                initialIsFollowing={isFollowing} 
              />
            )}
            {isOwner && (
              <PostActions postId={post.id} imageUrl={post.image_url} />
            )}
          </div>
        </div>


        {/* Description */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-xl font-heading tracking-wider uppercase">
              {post.location_name || t.untitled}
            </h1>
            <div className="flex gap-2">
              <LikeButton 
                postId={post.id} 
                initialLikeCount={post.like_count || 0} 
                initialIsLiked={isLiked}
                variant="ghost"
                size="default"
                showCount
                className="bg-white/5 border-white/10 px-4 py-1 h-10 rounded-full"
              />
              <BookmarkButton
                postId={post.id}
                initialIsBookmarked={isBookmarked}
                variant="ghost"
                size="icon"
                className="bg-white/5 border-white/10 rounded-full w-10 h-10"
                iconClassName="text-white"
              />
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {post.description || t.noDescription}
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
            {t.cameraSettings}
          </h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">{t.camera}</div>
              <div>{post.camera_model || t.unknown}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">{t.aperture}</div>
              <div>{post.aperture ? `f/${post.aperture}` : t.unknown}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">{t.shutter}</div>
              <div>{post.shutter_speed || t.unknown}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">{t.iso}</div>
              <div>{post.iso ? `ISO ${post.iso}` : t.unknown}</div>
            </div>
            {post.focal_length && (
              <div>
                <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">{t.focalLength}</div>
                <div>{post.focal_length}mm</div>
              </div>
            )}
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-[#111] p-6 text-sm border border-white/5 rounded-sm">
          <h3 className="font-heading tracking-wider uppercase flex items-center mb-4 text-[var(--accent)] text-xs">
            <MapPin className="w-4 h-4 mr-2" />
            {t.location}
          </h3>
          <div className="h-[250px] overflow-hidden">
             <PostDetailMap latitude={post.latitude} longitude={post.longitude} />
          </div>
        </div>

        {/* Spacer for mobile bottom bar if needed */}
        <div className="h-4" />
      </motion.div>
    </motion.div>
  );
}
