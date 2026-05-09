"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostPreviewSheet } from "@/components/post/PostPreviewSheet";
import { GlobeMap } from "@/components/map/GlobeMap";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // 1. Fetch posts first to show markers ASAP
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            id, user_id, latitude, longitude, location_name,
            image_url, camera_model, focal_length, aperture,
            shutter_speed, iso, created_at, description, tags,
            recipe_name, recipe_type, like_count,
            profiles(username, avatar_url)
          `);
          
        if (postsError) throw postsError;

        if (postsData) {
          const formattedPosts = postsData.map((post: any) => ({
            ...post,
            lat: post.latitude,
            lng: post.longitude,
            title: post.location_name
          }));
          setPosts(formattedPosts);
        }

        // posts가 로드되면 일단 로딩 해제 (마커 표시)
        setLoading(false);

        // 2. Fetch user interactions in background
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (user) {
          const [likesRes, bookmarksRes] = await Promise.all([
            supabase.from('likes').select('post_id').eq('user_id', user.id),
            supabase.from('bookmarks').select('post_id').eq('user_id', user.id)
          ]);
          
          if (likesRes.data) {
            setLikedPostIds(new Set(likesRes.data.map(l => l.post_id)));
          }
          if (bookmarksRes.data) {
            setBookmarkedPostIds(new Set(bookmarksRes.data.map(b => b.post_id)));
          }
        }
      } catch (err) {
        console.error("Error in Home data fetch:", err);
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#00000A] text-white">
      <Navbar variant="transparent" />

      {/* Main Map Container */}
      <div className="absolute inset-0">
        <GlobeMap posts={posts} onMarkerClick={setSelectedPost} />
      </div>

      {/* Side Panel Overlay */}
      {selectedPost && (
        <PostPreviewSheet
          post={selectedPost}
          isLiked={likedPostIds.has(selectedPost.id.toString())}
          isBookmarked={bookmarkedPostIds.has(selectedPost.id.toString())}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[60] bg-[#00000A] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-heading tracking-[0.2em] uppercase text-xs text-gray-500 animate-pulse">
            Initializing World
          </p>
        </div>
      )}
    </div>
  );
}
