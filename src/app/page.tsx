"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostPreviewSheet } from "@/components/post/PostPreviewSheet";
import { GlobeMap } from "@/components/map/GlobeMap";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient();

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialView, setInitialView] = useState<{ center: [number, number], zoom: number } | null>(null);


  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. Fetch Geolocation (fast, non-blocking past 1.5s)
      const locPromise = new Promise<{ center: [number, number], zoom: number }>((resolve) => {
        const fallback = { center: [126.978, 37.5665] as [number, number], zoom: 2 };
        if (!navigator.geolocation) {
          return resolve(fallback);
        }
        
        const timeout = setTimeout(() => {
          console.warn("Home: Geolocation timeout");
          resolve(fallback);
        }, 1500); // 1.5s max wait for GPS
        
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeout);
            resolve({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 10 });
          },
          (err) => {
            clearTimeout(timeout);
            console.warn("Home: Geolocation error", err);
            resolve(fallback);
          },
          { enableHighAccuracy: false, timeout: 1500, maximumAge: 60000 }
        );
      });

      // 2. Fetch Posts (Async, independent of map mounting)
      const fetchPostsAsync = async () => {
        try {
          const { data, error } = await supabase.from('posts').select(`
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
        }
      };

      // 3. Fetch User Interactions (Async, non-blocking)
      const fetchUserInteractions = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const user = session?.user;
          
          if (user) {
            const [likesRes, bookmarksRes] = await Promise.all([
              supabase.from('likes').select('post_id').eq('user_id', user.id),
              supabase.from('bookmarks').select('post_id').eq('user_id', user.id)
            ]);
            
            if (likesRes.data) setLikedPostIds(new Set(likesRes.data.map((like: { post_id: string }) => like.post_id)));
            if (bookmarksRes.data) setBookmarkedPostIds(new Set(bookmarksRes.data.map((bookmark: { post_id: string }) => bookmark.post_id)));
          }
        } catch (err) {
          console.error("Home: Error fetching interactions:", err);
        }
      };

      try {
        setLoading(true);
        
        // Start background fetches
        fetchPostsAsync();
        fetchUserInteractions();

        // Wait ONLY for location to determine map center
        const loc = await locPromise;
        setInitialView(loc);
      } catch (err) {
        console.error("Home: Fatal error initializing map:", err);
        setInitialView({ center: [126.978, 37.5665], zoom: 2 });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);


  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#00000A] text-white">
      <Navbar variant="transparent" />

      {/* Main Map Container */}
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


      {/* Side Panel Overlay */}
      <PostPreviewSheet
        post={selectedPost}
        isLiked={selectedPost ? likedPostIds.has(selectedPost.id.toString()) : false}
        isBookmarked={selectedPost ? bookmarkedPostIds.has(selectedPost.id.toString()) : false}
        onClose={() => setSelectedPost(null)}
      />

      {/* Loading Overlay */}
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
