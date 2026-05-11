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
      // Safety timeout to prevent infinite loading
      const safetyTimeout = setTimeout(() => {
        if (loading) {
          console.warn("Home: Safety timeout reached, forcing loading state to false");
          setLoading(false);
          if (!initialView) {
            setInitialView({ center: [126.978, 37.5665], zoom: 2 });
          }
        }
      }, 8000); // 8 seconds safety window

      try {
        console.log("Home: Starting initial data fetch...");
        setLoading(true);

        // 1. Get Geolocation and Fetch posts in parallel
        const [geoRes, postsRes] = await Promise.allSettled([
          new Promise<{ lng: number, lat: number }>((resolve, reject) => {
            if (!navigator.geolocation) return reject("No geolocation support");
            
            // Extra safety: reject if geolocation takes too long (already has timeout, but just in case)
            const geoTimeout = setTimeout(() => reject("Geolocation custom timeout"), 5000);
            
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                clearTimeout(geoTimeout);
                resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude });
              },
              (err) => {
                clearTimeout(geoTimeout);
                reject(err);
              },
              { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
            );
          }),
          supabase.from('posts').select(`
            id, user_id, latitude, longitude, location_name,
            image_url, camera_model, focal_length, aperture,
            shutter_speed, iso, created_at, description, tags,
            recipe_name, recipe_type, like_count,
            profiles(username, avatar_url)
          `)
        ]);

        console.log("Home: Initial fetch settled", { geoStatus: geoRes.status, postsStatus: postsRes.status });

        // Handle Geolocation
        if (geoRes.status === 'fulfilled') {
          setInitialView({ center: [geoRes.value.lng, geoRes.value.lat], zoom: 10 });
        } else {
          console.log("Home: Using default view (Seoul)", geoRes.reason);
          setInitialView({ center: [126.978, 37.5665], zoom: 2 });
        }

        // Handle Posts
        if (postsRes.status === 'fulfilled' && postsRes.value.data) {
          const formattedPosts = postsRes.value.data.map((post: any) => ({
            ...post,
            lat: post.latitude,
            lng: post.longitude,
            title: post.location_name
          }));
          setPosts(formattedPosts);
        } else if (postsRes.status === 'fulfilled' && postsRes.value.error) {
          console.error("Home: Error fetching posts:", postsRes.value.error);
        }

        // 2. Fetch user interactions in background
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
        console.error("Home: Unexpected error in fetchInitialData:", err);
      } finally {
        clearTimeout(safetyTimeout);
        setLoading(false);
        // Ensure initialView is NEVER null after loading is false
        setInitialView(prev => prev || { center: [126.978, 37.5665], zoom: 2 });
        console.log("Home: Loading completed");
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
