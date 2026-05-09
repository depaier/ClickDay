"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { supabase } from "@/lib/supabase/client";

export default function FeedPage() {
  const { language } = useLanguage();
  const t = translations[language].feed;

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

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link href={`/posts/${post.id}`} key={post.id} className="group cursor-pointer">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#111] border border-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={post.image_url} 
                  alt={post.location_name || "Photography"} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="font-heading tracking-wider uppercase text-lg">
                    {post.location_name || "Untitled"}
                  </h3>
                  <div className="flex items-center text-gray-300 text-sm mt-2">
                    <MapPin className="w-4 h-4 mr-1 text-[var(--accent)]" />
                    {post.location_name || "Unknown Location"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-sm">
          <p className="text-gray-500 uppercase tracking-widest text-sm">No posts found in the feed.</p>
        </div>
      )}
    </div>
  );
}
