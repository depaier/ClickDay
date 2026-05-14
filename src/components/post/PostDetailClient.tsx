"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Camera, Maximize2, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { DeletePostButton } from "@/components/post/DeletePostButton";
import { LikeButton } from "@/components/post/LikeButton";
import { BookmarkButton } from "@/components/post/BookmarkButton";
import { FollowButton } from "@/components/user/FollowButton";
import Link from "next/link";
import { PostDetailMap } from "@/components/map/PostDetailMap";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Lock body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  return (
    <>
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
        <motion.img 
          layoutId={`post-image-${post.id}`}
          src={post.image_url} 
          alt={post.location_name || "Post detail"} 
          className="max-w-full max-h-[80vh] object-contain cursor-zoom-in"
          transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
          onClick={() => setIsExpanded(true)}
        />
        
        {/* Expand Button - Bottom Right */}
        <div className="absolute bottom-6 right-6 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border-white/10 text-white hover:bg-black/70 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
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
          <div className="h-[180px] overflow-hidden">
             <PostDetailMap latitude={post.latitude} longitude={post.longitude} />
          </div>
        </div>

        {/* Spacer for mobile bottom bar if needed */}
        <div className="h-4" />
      </motion.div>
    </motion.div>

    {/* Full Screen Expanded Modal */}
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setIsExpanded(false)}
        >
          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2"
            onClick={() => setIsExpanded(false)}
          >
            <X className="w-8 h-8" />
          </motion.button>

          <div className="w-full h-full flex items-center justify-center p-4 md:p-12">
            <motion.img 
              layoutId={`post-image-${post.id}`}
              src={post.image_url} 
              alt={post.location_name || "Post detail"} 
              className="max-w-full max-h-full object-contain shadow-2xl"
              transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
