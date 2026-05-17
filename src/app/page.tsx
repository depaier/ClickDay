"use client";

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostPreviewSheet } from "@/components/post/PostPreviewSheet";
import { GlobeMap, type GlobeMapRef } from "@/components/map/GlobeMap";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from "next/navigation";
import { PostGroupSheet } from "@/components/post/PostGroupSheet";
import { LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { IntroScreen } from "@/components/layout/IntroScreen";


// Dedicated client for public data fetching, completely ignoring auth state.
// This prevents the infinite lock on visibilitychange.
const supabaseData = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  }
);

function HomeContent() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [hoveredPost, setHoveredPost] = useState<any | null>(null);
  const [listHoveredPost, setListHoveredPost] = useState<any | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [initialView, setInitialView] = useState<{ center: [number, number], zoom: number } | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const isFetchingRef = useRef(false);
  const mapRef = useRef<GlobeMapRef>(null);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('intro_seen') === 'true') {
      setIntroCompleted(true);
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('intro_seen', 'true');
    }
    setIntroCompleted(true);
  }, []);

  const fetchPosts = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const { data, error } = await supabaseData.from('posts').select(`
        id, user_id, latitude, longitude, location_name, title,
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
          title: post.title || post.location_name
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

  // Initial load - Geolocation and posts are fetched immediately in the background during intro play
  useEffect(() => {
    const initMap = async () => {
      setLoading(true);
      
      const loc = await new Promise<{ center: [number, number], zoom: number }>((resolve) => {
        // Fallback to Seoul with a proper zoom, completely removing the zoom 2 globe view
        const fallback = { center: [126.978, 37.5665] as [number, number], zoom: 10 };
        if (!navigator.geolocation) return resolve(fallback);
        
        // Generous 5-second timeout ensures GPS is firmly locked before rendering
        const timer = setTimeout(() => resolve(fallback), 5000);
        
        navigator.geolocation.getCurrentPosition(
          (pos) => { 
            clearTimeout(timer); 
            resolve({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14 }); 
          },
          () => { 
            clearTimeout(timer); 
            resolve(fallback); 
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
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

  // URL state recovery
  useEffect(() => {
    if (posts.length === 0) return;
    
    const groupParam = searchParams.get('group');
    const selectedParam = searchParams.get('selected');
    
    if (groupParam) {
      const ids = groupParam.split(',');
      const foundGroup = posts.filter(p => ids.includes(p.id.toString()));
      if (foundGroup.length > 0) {
        setSelectedGroup(foundGroup);
        if (selectedParam) {
          const foundPost = foundGroup.find(p => p.id.toString() === selectedParam);
          if (foundPost) setSelectedPost(foundPost);
        }
      }
    } else if (selectedParam) {
      const foundPost = posts.find(p => p.id.toString() === selectedParam);
      if (foundPost) setSelectedPost(foundPost);
    }
  }, [posts, searchParams]);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedGroup) {
      params.set('group', selectedGroup.map(p => p.id).join(','));
      if (selectedPost) params.set('selected', selectedPost.id.toString());
      else params.delete('selected');
    } else if (selectedPost) {
      params.delete('group');
      params.set('selected', selectedPost.id.toString());
    } else {
      params.delete('group');
      params.delete('selected');
    }

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();
    
    if (newQuery !== currentQuery) {
      const url = newQuery ? `/?${newQuery}` : '/';
      window.history.replaceState(null, '', url);
    }
  }, [selectedGroup, selectedPost, searchParams]);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo([pos.coords.longitude, pos.coords.latitude], 14);
      },
      (err) => {
        console.error("Home: Error getting current location:", err);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  const handleMarkerClick = useCallback((post: any) => {
    setSelectedGroup(null);
    setSelectedPost(post);
  }, []);

  const handleGroupClick = useCallback((group: any[]) => {
    setSelectedGroup(group);
    setSelectedPost(null);
  }, []);

  const handleMapClick = useCallback(() => {
    setSelectedGroup(null);
    setSelectedPost(null);
  }, []);

  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#00000A] text-white">
      <Navbar variant="transparent" />

      <div className="absolute inset-0">
        {initialView && (
          <GlobeMap 
            ref={mapRef}
            posts={posts} 
            onMarkerClick={handleMarkerClick} 
            onMarkerHover={setHoveredPost}
            onGroupClick={handleGroupClick}
            onMapClick={handleMapClick}
            highlightedPostId={listHoveredPost?.id || selectedPost?.id}
            initialCenter={initialView.center}
            initialZoom={initialView.zoom}
          />
        )}
      </div>

      {/* Location Button */}
      <div className={cn(
        "absolute bottom-10 transition-all duration-500 ease-in-out z-50",
        (selectedPost || selectedGroup) ? "right-8 md:right-[420px]" : "right-8"
      )}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMyLocation}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-2xl group"
          title="My Location"
        >
          <LocateFixed size={20} className="group-hover:text-[var(--accent)] transition-colors" />
        </motion.button>
      </div>

      {/* Group View */}
      <PostGroupSheet
        posts={selectedGroup}
        selectedPostId={selectedPost?.id}
        onSelectPost={setSelectedPost}
        onHoverPost={setListHoveredPost}
        onClose={() => {
          setSelectedGroup(null);
          setSelectedPost(null);
        }}
      />

      {/* Single View (only if no group) */}
      {!selectedGroup && (
        <PostPreviewSheet
          post={selectedPost}
          isLiked={selectedPost ? likedPostIds.has(selectedPost.id.toString()) : false}
          isBookmarked={selectedPost ? bookmarkedPostIds.has(selectedPost.id.toString()) : false}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Pre-fetch hovered image */}
      {(hoveredPost?.image_url || listHoveredPost?.image_url) && (
        <div className="hidden">
          <Image 
            src={hoveredPost?.image_url || listHoveredPost?.image_url} 
            alt="preload" 
            width={1} 
            height={1} 
            priority
          />
        </div>
      )}

      <AnimatePresence>
        {mounted && !introCompleted && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-[60]"
          >
            <IntroScreen onComplete={handleIntroComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-[#00000A]" />}>
      <HomeContent />
    </Suspense>
  );
}
