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
  const [initialView, setInitialView] = useState<{ center: [number, number], zoom: number } | null>(null);


  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // 1. Get Geolocation and Fetch posts in parallel
        const [geoRes, postsRes] = await Promise.allSettled([
          new Promise<{ lng: number, lat: number }>((resolve, reject) => {
            if (!navigator.geolocation) return reject("No geolocation");
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
              (err) => reject(err),
              { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
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

        // Handle Geolocation
        if (geoRes.status === 'fulfilled') {
          setInitialView({ center: [geoRes.value.lng, geoRes.value.lat], zoom: 10 });
        } else {
          // Default to Seoul if geolocation fails
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
        }

        setLoading(false);

        // 2. Fetch user interactions in background
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (user) {
          const [likesRes, bookmarksRes] = await Promise.all([
            supabase.from('likes').select('post_id').eq('user_id', user.id),
            supabase.from('bookmarks').select('post_id').eq('user_id', user.id)
          ]);
          
          if (likesRes.data) setLikedPostIds(new Set(likesRes.data.map(l => l.post_id)));
          if (bookmarksRes.data) setBookmarkedPostIds(new Set(bookmarksRes.data.map(b => b.post_id)));
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
