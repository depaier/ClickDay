"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { PostCard } from "@/components/post/PostCard";
import { FilterChips } from "@/components/feed/FilterChips";
import { FilterDrawer } from "@/components/feed/FilterDrawer";
import { SearchBar } from "@/components/feed/SearchBar";
import { useSearchParams, useRouter } from "next/navigation";
import { MasonryGrid } from "@/components/layout/MasonryGrid";
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

interface Post {
  id: string;
  image_url: string;
  location_name: string | null;
  like_count: number;
  user_id: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

function FeedContent() {
  const { language } = useLanguage();
  const t = translations[language].feed;
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter") || "all";
  const sortParam = searchParams.get("sort") || "latest";
  const regionParam = searchParams.get("region");
  const brandParam = searchParams.get("brand");
  const qParam = searchParams.get("q");
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 12;

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  const fetchFeed = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    if (isInitial) {
      setIsLoading(true);
      setPage(0);
      setHasMore(true);
    } else {
      setIsFetchingMore(true);
    }

    const currentPage = isInitial ? 0 : page;

    try {
      if (filterParam === "clicking") {
        if (!user) {
          setPosts([]);
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }

        const { data: followingData } = await supabaseData
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);

        const followingIds = followingData?.map((f: { following_id: string }) => f.following_id) || [];

        if (followingIds.length === 0) {
          setPosts([]);
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }

        const { data: postsData } = await supabaseData
          .from("posts")
          .select("*, profiles(username, avatar_url)")
          .in("user_id", followingIds)
          .order(sortParam === "popular" ? "like_count" : "created_at", { ascending: false })
          .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

        if (isInitial) {
          setPosts(postsData || []);
        } else {
          setPosts(prev => [...prev, ...(postsData || [])]);
        }
        
        setHasMore((postsData?.length || 0) === PAGE_SIZE);
        setPage(currentPage + 1);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      let query = supabaseData.from("posts").select("*, profiles(username, avatar_url)");

      if (qParam) {
        query = query.or(`location_name.ilike.%${qParam}%,description.ilike.%${qParam}%,tags.cs.{"${qParam}"}`);
      }
      if (regionParam) {
        query = query.eq("region", regionParam);
      }
      if (brandParam) {
        query = query.eq("camera_brand", brandParam);
      }
      
      query = query
        .order(sortParam === "popular" ? "like_count" : "created_at", { ascending: false })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;
      
      if (isInitial) {
        setPosts(postsData || []);
      } else {
        setPosts(prev => [...prev, ...(postsData || [])]);
      }
      
      setHasMore((postsData?.length || 0) === PAGE_SIZE);
      setPage(currentPage + 1);

      if (isInitial && user?.id) {
        const [likesRes, bookmarksRes] = await Promise.all([
          supabaseData.from('likes').select('post_id').eq('user_id', user.id),
          supabaseData.from('bookmarks').select('post_id').eq('user_id', user.id),
        ]);
        if (likesRes.data) setLikedPostIds(new Set(likesRes.data.map((l: { post_id: string }) => l.post_id)));
        if (bookmarksRes.data) setBookmarkedPostIds(new Set(bookmarksRes.data.map((b: { post_id: string }) => b.post_id)));
      }
    } catch (error: any) {
      console.error("Error fetching feed:", error.message || error);
      if (isInitial) setPosts([]);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      isFetchingRef.current = false;
    }
  }, [filterParam, sortParam, regionParam, brandParam, qParam, user, page]);

  useEffect(() => {
    fetchFeed(true);
  }, [filterParam, sortParam, regionParam, brandParam, qParam, user]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingMore) {
          fetchFeed(false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchFeed, hasMore, isLoading, isFetchingMore]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        isFetchingRef.current = false;
        fetchFeed(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchFeed]);

  return (
    <div>
      <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-heading tracking-[0.2em] uppercase">{t.title}</h1>
          <p className="text-gray-400 mt-2">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-6 font-heading tracking-widest text-[10px] uppercase">
          <div className="flex gap-6 border-r border-white/10 pr-6 mr-2">
            <button
              onClick={() => handleSortChange("latest")}
              className={`transition-all duration-300 pb-1 border-b ${sortParam === "latest" ? "text-[var(--accent)] border-[var(--accent)]" : "text-gray-500 hover:text-white border-transparent"
                }`}
            >
              {t.latest}
            </button>
            <button
              onClick={() => handleSortChange("popular")}
              className={`transition-all duration-300 pb-1 border-b ${sortParam === "popular" ? "text-[var(--accent)] border-[var(--accent)]" : "text-gray-500 hover:text-white border-transparent"
                }`}
            >
              {t.popular}
            </button>
          </div>
          <FilterDrawer />
        </div>
      </div>

      <SearchBar />
      <FilterChips />

      {isLoading ? (
        <MasonryGrid>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-sm border border-white/5" />
          ))}
        </MasonryGrid>
      ) : (
        <>
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
              <div className="col-span-full py-32 text-center border border-dashed border-white/10 rounded-sm bg-white/5 flex flex-col items-center">
                <p className="text-gray-500 font-heading tracking-widest uppercase mb-2">{t.noPostsFound}</p>
                <p className="text-xs text-gray-600 mb-8">{t.tryDifferentFilter}</p>
                <button
                  onClick={() => router.push('/feed')}
                  className="px-6 py-2 border border-white/10 hover:border-[var(--accent)] hover:text-[var(--accent)] text-[10px] font-heading tracking-widest uppercase transition-all duration-300 rounded-full bg-black"
                >
                  {language === 'ko' ? '모든 필터 초기화' : 'Reset All Filters'}
                </button>
              </div>
            )}
          </MasonryGrid>
          
          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8">
            {isFetchingMore && (
              <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin opacity-50"></div>
            )}
            {!hasMore && posts.length > 0 && (
              <p className="text-[10px] text-gray-600 font-heading tracking-[0.2em] uppercase">
                {language === 'ko' ? '모든 게시물을 확인했습니다' : 'End of feed'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}
