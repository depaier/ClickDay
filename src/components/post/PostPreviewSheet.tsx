"use client";

import React from "react";
import { X, MapPin, Camera, Aperture, Clock, Hash } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../providers/AuthProvider";
import { DeletePostButton } from "./DeletePostButton";
import { LikeButton } from "./LikeButton";
import { BookmarkButton } from "./BookmarkButton";
import Link from "next/link";
import { GeocodedAddress } from "@/components/map/GeocodedAddress";
import { useLanguage } from "../providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { motion, AnimatePresence } from "framer-motion";
import { PostActions } from "./PostActions";

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
  post: Post | null;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onClose: () => void;
}

export function PostPreviewSheet({ post, isLiked = false, isBookmarked = false, onClose }: PostPreviewSheetProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language].post;
  const isOwner = user?.id === post?.user_id;

  return (
    <AnimatePresence>
      {post && (
        <motion.div 
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-[60px] bottom-0 w-full md:w-[400px] bg-white text-black shadow-2xl z-50 border-l border-gray-200 overflow-y-auto"
        >
          <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 flex justify-between items-center p-4 border-b border-gray-100">
            <h2 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-gray-900">{t.details}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-0 pb-20">
            {/* Photo Area */}
            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={post.image_url} 
                alt={post.location_name || "Photography"} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            <div className="p-6 space-y-8">
              {/* Photographer info & Actions */}
              <div className="flex items-center justify-between">
                <Link href={`/users/@${post.profiles?.username}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-black/5 group-hover:border-[var(--accent)] transition-colors">
                    <img src={post.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles?.username || "unknown"}`} alt={post.profiles?.username || "user"} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm group-hover:text-[var(--accent)] transition-colors">{post.profiles?.username || "photographer"}</p>
                    <p className="text-xs text-gray-500" suppressHydrationWarning>
                      {post.created_at ? new Date(post.created_at).toLocaleDateString() : t.recently}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <LikeButton 
                    postId={post.id.toString()} 
                    initialLikeCount={post.like_count || 0} 
                    initialIsLiked={isLiked}
                    variant="ghost"
                    size="default"
                    showCount
                    className="bg-black/5 border-black/5 px-4 py-1 h-10 rounded-full"
                  />
                  <BookmarkButton
                    postId={post.id.toString()}
                    initialIsBookmarked={isBookmarked}
                    variant="ghost"
                    size="icon"
                    className="bg-black/5 border-black/5 rounded-full w-10 h-10 text-black"
                    iconClassName="text-black"
                  />
                  {isOwner && (
                    <PostActions 
                      postId={post.id.toString()} 
                      imageUrl={post.image_url}
                      iconClassName="text-gray-600 hover:text-black"
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold tracking-tight uppercase text-gray-900">{post.location_name || t.untitled}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {post.description || t.noDescription}
                </p>
              </div>

              {/* EXIF Data */}
              <div className="space-y-4">
                <h3 className="font-heading text-xs text-[var(--accent-dark)] tracking-[0.167em] uppercase border-b border-gray-100 pb-2 flex items-center gap-2">
                  <Camera className="w-3 h-3" />
                  {t.cameraSettings}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t.camera}</span>
                    <span className="truncate text-gray-800">{post.camera_model || t.unknown}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t.aperture}</span>
                    <span className="text-gray-800">{post.aperture ? `f/${post.aperture}` : t.unknown}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t.shutter}</span>
                    <span className="text-gray-800">{post.shutter_speed || t.unknown}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">ISO</span>
                    <span className="text-gray-800">{post.iso ? `ISO ${post.iso}` : t.unknown}</span>
                  </div>
                  {post.focal_length && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t.focalLength}</span>
                      <span className="text-gray-800">{post.focal_length}mm</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t.location}</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--accent-dark)]" />
                      <GeocodedAddress 
                        latitude={post.latitude} 
                        longitude={post.longitude} 
                        className="truncate max-w-[120px] text-gray-800"
                        fallback={t.unknown}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="flex items-center text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div className="p-6 sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-100">
              <Link href={`/posts/${post.id}`}>
                <Button variant="accent" className="w-full h-12 text-sm font-heading tracking-widest uppercase">
                  {t.viewPost}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
