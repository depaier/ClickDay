"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MasonryGrid } from "@/components/layout/MasonryGrid";
import { PostCard } from "@/components/post/PostCard";
import Image from "next/image";
import { FollowButton } from "@/components/user/FollowButton";
import { ProfileStats } from "@/components/user/ProfileStats";
import { ProfileTabs } from "@/components/user/ProfileTabs";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { motion } from "framer-motion";

interface ProfileClientProps {
  profile: any;
  isOwnProfile: boolean;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  ownPostsCount: number;
  displayPosts: any[];
  likedPostIds: Set<string>;
  bookmarkedPostIds: Set<string>;
  tab: string;
}

export function ProfileClient({
  profile,
  isOwnProfile,
  isFollowing,
  followersCount,
  followingCount,
  ownPostsCount,
  displayPosts,
  likedPostIds,
  bookmarkedPostIds,
  tab,
}: ProfileClientProps) {
  const { language } = useLanguage();
  const t = translations[language].profile;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 pb-12 border-b border-white/10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/5 shadow-xl bg-[#222]"
        >
          <img 
            src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
            alt={profile.username} 
            className="w-full h-full object-cover" 
          />
        </motion.div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h1 className="text-2xl font-heading tracking-widest uppercase">{profile.username}</h1>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="h-8">{t.editProfile}</Button>
                </Link>
              ) : (
                <FollowButton 
                  targetUserId={profile.id} 
                  initialIsFollowing={isFollowing} 
                />
              )}
            </div>
          </div>
          
          <ProfileStats 
            postsCount={ownPostsCount} 
            followersCount={followersCount} 
            followingCount={followingCount} 
          />
          
          <div className="text-gray-300 text-sm max-w-md mx-auto md:mx-0">
            <p className="mb-4 whitespace-pre-wrap">{profile.bio || t.noBio}</p>
            {profile.instagram && (
              <div className="flex items-center gap-2 text-zinc-300 justify-center md:justify-start">
                <Image src="/logos/instagram.svg" alt="Instagram" width={16} height={16} className="opacity-80" />
                <a 
                  href={`https://instagram.com/${profile.instagram.replace(/^@/, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm hover:text-white transition-colors"
                >
                  {profile.instagram}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ProfileTabs isOwnProfile={isOwnProfile} />

      <MasonryGrid>
        {displayPosts?.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <PostCard 
              post={post as any} 
              isLiked={likedPostIds.has(post.id)}
              isBookmarked={bookmarkedPostIds.has(post.id)}
            />
          </motion.div>
        ))}
        {(!displayPosts || displayPosts.length === 0) && (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-sm">
            <p className="text-gray-500 font-heading tracking-widest uppercase">
              {tab === "saved" ? t.noSavedPosts : t.noUploads}
            </p>
          </div>
        )}
      </MasonryGrid>
    </motion.div>
  );
}
