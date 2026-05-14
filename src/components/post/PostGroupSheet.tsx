"use client";

import React from "react";
import { X, MapPin, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { GeocodedAddress } from "@/components/map/GeocodedAddress";
import Link from "next/link";

interface Post {
  id: string | number;
  latitude: number;
  longitude: number;
  location_name: string;
  image_url?: string;
  created_at?: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
  [key: string]: any;
}

interface PostGroupSheetProps {
  posts: Post[] | null;
  selectedPostId: string | number | null;
  onSelectPost: (post: Post) => void;
  onHoverPost?: (post: Post | null) => void;
  onClose: () => void;
}

export function PostGroupSheet({ 
  posts, 
  selectedPostId, 
  onSelectPost,
  onHoverPost,
  onClose 
}: PostGroupSheetProps) {
  const { language } = useLanguage();
  const t = translations[language].post;
  const mt = translations[language].map;

  // Create a unique key for the group to trigger animations when group changes
  const groupKey = posts ? posts.map(p => p.id).sort().join('-') : 'empty';

  return (
    <AnimatePresence>
      {posts && posts.length > 0 && (
        <motion.div
          key={groupKey}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-[60px] bottom-0 w-full md:w-[400px] bg-white text-black shadow-2xl z-50 border-l border-gray-200 flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <h2 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-gray-900">
                {language === 'ko' ? '주변 사진' : 'Nearby Photos'}
              </h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                {posts.length} {language === 'ko' ? '개의 게시물' : 'items found'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {posts.map((post) => {
              const isSelected = selectedPostId?.toString() === post.id.toString();
              return (
                <motion.div
                  key={post.id}
                  layoutId={`post-card-${post.id}`}
                  onClick={() => onSelectPost(post)}
                  onMouseEnter={() => onHoverPost?.(post)}
                  onMouseLeave={() => onHoverPost?.(null)}
                  className={`
                    group relative flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? "bg-[var(--accent)]/10 ring-1 ring-[var(--accent)] shadow-md" 
                      : "bg-gray-50 hover:bg-gray-100 border border-transparent"}
                  `}
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 shadow-inner">
                    {post.image_url ? (
                      <img 
                        src={post.image_url} 
                        alt={post.location_name} 
                        className="w-full h-full object-cover transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-[var(--accent-dark)] transition-colors">
                        {post.location_name || t.untitled}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-gray-500">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <GeocodedAddress 
                          latitude={post.latitude} 
                          longitude={post.longitude} 
                          className="text-[11px] truncate"
                          fallback={t.unknown}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <Link 
                        href={`/users/@${post.profiles?.username}`} 
                        className="flex items-center gap-2 group/profile"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 border border-white group-hover/profile:border-[var(--accent)] transition-colors">
                          <img 
                            src={post.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles?.username || "user"}`} 
                            alt={post.profiles?.username} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-medium text-gray-600 truncate max-w-[80px] group-hover/profile:text-[var(--accent-dark)] transition-colors">
                          {post.profiles?.username}
                        </span>
                      </Link>
                      
                      <Link href={`/posts/${post.id}`} onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="
                            h-7 px-3 text-[10px] font-bold uppercase tracking-tighter transition-all duration-300
                            bg-gray-200 text-gray-500
                            group-hover:bg-[var(--accent)] group-hover:text-black
                            hover:!bg-[var(--accent-dark)] hover:!text-white
                            active:scale-95 active:!bg-black active:!text-white
                          "
                        >
                          {t.viewPost}
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div 
                      layoutId="selection-indicator"
                      className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[var(--accent)] rounded-r-full"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
          
          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #e5e7eb;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #d1d5db;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
