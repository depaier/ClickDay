"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "@/components/post/PostCard";
import { MasonryGrid } from "@/components/layout/MasonryGrid";


interface Post {
  id: string;
  image_url: string;
  location_name: string | null;
  like_count: number;
  user_id: string;
  created_at: string;
}

const supabase = createClient();

export default function FeedPage() {
  const { language } = useLanguage();
  const t = translations[language].feed;
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"latest" | "popular">("latest");

  useEffect(() => {
    async function fetchFeed() {
      setIsLoading(true);
      try {
        // Fetch posts
        let query = supabase.from("posts").select("*");

        if (filter === "latest") {
          query = query.order("created_at", { ascending: false });
        } else {
          // For now, popular is also sorted by latest but could be liked_count in the future
          query = query.order("like_count", { ascending: false });
        }

        const { data: postsData, error: postsError } = await query;

        if (postsError) throw postsError;
        setPosts(postsData || []);

        // Fetch current user's interactions if logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
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
          } catch (interactionError) {
            console.error("Background interaction fetch failed:", interactionError);
          }
        }
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeed();
  }, [supabase, filter]);

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
        <MasonryGrid>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-sm mb-6" />
          ))}
        </MasonryGrid>
      ) : (
        <MasonryGrid>

          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              isLiked={likedPostIds.has(post.id)} 
              isBookmarked={bookmarkedPostIds.has(post.id)}
            />
          ))}
          {posts.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-sm">
              <p className="text-gray-500 font-heading tracking-widest uppercase">No posts found</p>
            </div>
          )}
        </MasonryGrid>
      )}

    </div>
  );
}
