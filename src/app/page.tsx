"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostPreviewSheet } from "@/components/post/PostPreviewSheet";
import { GlobeMap } from "@/components/map/GlobeMap";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          latitude,
          longitude,
          location_name,
          image_url,
          camera_model,
          focal_length,
          aperture,
          shutter_speed,
          iso,
          created_at,
          description,
          tags,
          recipe_name,
          recipe_type,
          profiles(username, avatar_url)
        `);
        
      if (data) {
        const formattedPosts = data.map((post: any) => ({
          ...post,
          lat: post.latitude,
          lng: post.longitude,
          title: post.location_name
        }));
        setPosts(formattedPosts);
      }
    };
    
    fetchPosts();
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
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
