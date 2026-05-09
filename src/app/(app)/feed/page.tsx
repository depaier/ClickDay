"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "@/components/post/PostCard";

interface Post {
  id: string;
  image_url: string;
  location_name: string | null;
  like_count: number;
  user_id: string;
  created_at: string;
}

export default function FeedPage() {
  const { language } = useLanguage();
  const t = translations[language].feed;
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFeed() {
      setIsLoading(true);
      try {
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData || []);

        // Fetch current user's likes if logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: likesData, error: likesError } = await supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", user.id);

          if (!likesError && likesData) {
            setLikedPostIds(new Set(likesData.map(l => l.post_id)));
          }
        }
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeed();
  }, [supabase]);

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"latest" | "popular">("latest");

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase.from("posts").select("*");

    if (filter === "latest") {
      query = query.order("created_at", { ascending: false });
    } else {
      // 인기순 로직 (현재는 임시로 최신순 유지하되 UI만 처리)
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-heading tracking-[0.2em] uppercase">{t.title}</h1>
          <p className="text-gray-400 mt-2">{t.subtitle}</p>
        </div>
        <div className="flex gap-6 font-heading tracking-widest text-sm uppercase">
          <button 
            onClick={() => setFilter("latest")}
            className={`transition-colors pb-1 border-b ${
              filter === "latest" ? "text-[var(--accent)] border-[var(--accent)]" : "text-gray-500 hover:text-white border-transparent"
            }`}
          >
            {t.latest}
          </button>
          <button 
            onClick={() => setFilter("popular")}
            className={`transition-colors pb-1 border-b ${
              filter === "popular" ? "text-[var(--accent)] border-[var(--accent)]" : "text-gray-500 hover:text-white border-transparent"
            }`}
          >
            {t.popular}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              isLiked={likedPostIds.has(post.id)} 
            />
          ))}
          {posts.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-sm">
              <p className="text-gray-500 font-heading tracking-widest uppercase">No posts found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
