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

  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPosts = async () => {
      // Fetch posts
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
          like_count,
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

      // Fetch user likes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: likesData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);
        
        if (likesData) {
          setLikedPostIds(new Set(likesData.map(l => l.post_id)));
        }

        // Fetch user bookmarks
        const { data: bookmarksData } = await supabase
          .from('bookmarks')
          .select('post_id')
          .eq('user_id', user.id);
        
        if (bookmarksData) {
          setBookmarkedPostIds(new Set(bookmarksData.map(b => b.post_id)));
        }
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
          isLiked={likedPostIds.has(selectedPost.id.toString())}
          isBookmarked={bookmarkedPostIds.has(selectedPost.id.toString())}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
