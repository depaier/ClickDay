"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostPreviewSheet } from "@/components/post/PostPreviewSheet";
import { GlobeMap } from "@/components/map/GlobeMap";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Dedicated client for public data fetching, completely ignoring auth state.
// This prevents the infinite lock on visibilitychange.
const supabaseData = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  }
);

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialView, setInitialView] = useState<{ center: [number, number], zoom: number } | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const isFetchingRef = useRef(false);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const { data, error } = await supabaseData.from('posts').select(`
        id, user_id, latitude, longitude, location_name,
        image_url, camera_model, focal_length, aperture,
        shutter_speed, iso, created_at, description, tags,
        recipe_name, recipe_type, like_count,
        profiles(username, avatar_url)
      `);

      if (error) {
        console.error("Home: Error fetching posts:", error);
        return;
      }

      if (data) {
        const formattedPosts = data.map((post: any) => ({
          ...post,
          lat: post.latitude,
          lng: post.longitude,
          title: post.location_name
        }));
        setPosts(formattedPosts);
      }
    } catch (err) {
      console.error("Home: Unexpected error fetching posts:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  const fetchUserInteractions = useCallback(async (userId: string) => {
    try {
      const [likesRes, bookmarksRes] = await Promise.all([
        supabaseData.from('likes').select('post_id').eq('user_id', userId),
        supabaseData.from('bookmarks').select('post_id').eq('user_id', userId),
      ]);

      if (likesRes.data) setLikedPostIds(new Set(likesRes.data.map((l: { post_id: string }) => l.post_id)));
      if (bookmarksRes.data) setBookmarkedPostIds(new Set(bookmarksRes.data.map((b: { post_id: string }) => b.post_id)));
    } catch (err) {
      console.error("Home: Error fetching interactions:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initMap = async () => {
      setLoading(true);
      const loc = await new Promise<{ center: [number, number], zoom: number }>((resolve) => {
        const fallback = { center: [126.978, 37.5665] as [number, number], zoom: 2 };
        if (!navigator.geolocation) return resolve(fallback);
        const timer = setTimeout(() => resolve(fallback), 1500);
        navigator.geolocation.getCurrentPosition(
          (pos) => { clearTimeout(timer); resolve({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 10 }); },
          () => { clearTimeout(timer); resolve(fallback); },
          { enableHighAccuracy: false, timeout: 1500, maximumAge: 60000 }
        );
      });
      setInitialView(loc);
      setLoading(false);
      fetchPosts();
    };
    initMap();
  }, [fetchPosts]);

  useEffect(() => {
    if (user?.id) fetchUserInteractions(user.id);
    else { setLikedPostIds(new Set()); setBookmarkedPostIds(new Set()); }
  }, [user, fetchUserInteractions]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        isFetchingRef.current = false;
        fetchPosts();
        if (user?.id) fetchUserInteractions(user.id);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchPosts, fetchUserInteractions, user]);

  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#00000A] text-white">
      <Navbar variant="transparent" />

      <div className="absolute inset-0">
        {initialView && (
          <GlobeMap 
            posts={posts} 
            onMarkerClick={setSelectedPost} 
            initialCenter={initialView.center}
            initialZoom={initialView.zoom}
          />
        )}
      </div>

      <PostPreviewSheet
        post={selectedPost}
        isLiked={selectedPost ? likedPostIds.has(selectedPost.id.toString()) : false}
        isBookmarked={selectedPost ? bookmarkedPostIds.has(selectedPost.id.toString()) : false}
        onClose={() => setSelectedPost(null)}
      />

      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-[60] bg-[#00000A] flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-heading tracking-[0.2em] uppercase text-xs text-gray-500 animate-pulse">
              {t.map.initializing}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
