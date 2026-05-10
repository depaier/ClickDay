"use client";

import { useState, useEffect, Suspense } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "@/components/post/PostCard";
import { FilterChips } from "@/components/feed/FilterChips";
import { FilterDrawer } from "@/components/feed/FilterDrawer";
import { SearchBar } from "@/components/feed/SearchBar";
import { useSearchParams, useRouter } from "next/navigation";
import { MasonryGrid } from "@/components/layout/MasonryGrid";


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

const supabase = createClient();

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
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    console.log("FeedContent: Fetching with params:", { filterParam, sortParam, regionParam, brandParam });
    async function fetchFeed() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        let query = supabase.from("posts").select("*, profiles(username, avatar_url)");

        // 0. 검색 로직 (Search)
        if (qParam) {
          query = query.or(`location_name.ilike.%${qParam}%,description.ilike.%${qParam}%,tags.cs.{${qParam}}`);
        }

        // 1. 기본 필터링 로직 (All / Clicking)
        if (filterParam === "clicking") {
          if (!user) {
            setPosts([]);
            setIsLoading(false);
            return;
          }
          const { data: followingData } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", user.id);
          
          const followingIds = followingData?.map(f => f.following_id) || [];
          
          if (followingIds.length > 0) {
            query = query.in("user_id", followingIds);
          } else {
            setPosts([]);
            setIsLoading(false);
            return;
          }
        }

        // 2. 고급 필터링 로직 (Region / Brand)
        if (regionParam) {
          query = query.eq("region", regionParam);
        }
        if (brandParam) {
          query = query.eq("camera_brand", brandParam);
        }

        // 3. 정렬 로직 (Sort)
        if (sortParam === "popular") {
          query = query.order("like_count", { ascending: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data: postsData, error: postsError } = await query;

        if (postsError) throw postsError;
        setPosts(postsData || []);

        // 인터랙션 데이터 가져오기
        if (user) {
          const [likesRes, bookmarksRes] = await Promise.all([
            supabase.from('likes').select('post_id').eq('user_id', user.id),
            supabase.from('bookmarks').select('post_id').eq('user_id', user.id)
          ]);
          
          if (likesRes.data) setLikedPostIds(new Set(likesRes.data.map(l => l.post_id)));
          if (bookmarksRes.data) setBookmarkedPostIds(new Set(bookmarksRes.data.map(b => b.post_id)));
        }
      } catch (error: any) {
        console.error("Error fetching feed details:", error.message || error);
        // DB 스키마(컬럼)가 없어서 발생하는 에러일 경우를 대비해 데이터를 비워줍니다.
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeed();
  }, [filterParam, sortParam, regionParam, brandParam, qParam]);

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
              className={`transition-all duration-300 pb-1 border-b ${
                sortParam === "latest" ? "text-[var(--accent)] border-[var(--accent)]" : "text-gray-500 hover:text-white border-transparent"
              }`}
            >
              {t.latest}
            </button>
            <button 
              onClick={() => handleSortChange("popular")}
              className={`transition-all duration-300 pb-1 border-b ${
                sortParam === "popular" ? "text-[var(--accent)] border-[var(--accent)]" : "text-gray-500 hover:text-white border-transparent"
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-sm border border-white/5" />
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
            <div className="col-span-full py-32 text-center border border-dashed border-white/10 rounded-sm bg-white/5">
              <p className="text-gray-500 font-heading tracking-widest uppercase mb-2">{t.noPostsFound}</p>
              <p className="text-xs text-gray-600">{t.tryDifferentFilter}</p>
            </div>
          )}
        </MasonryGrid>
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
