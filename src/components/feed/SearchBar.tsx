"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Hash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function SearchBar() {
  const { language } = useLanguage();
  const t = (translations[language] as any).feed.search;
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isFocused, setIsFocused] = useState(false);
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // URL 파라미터와 동기화
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // 추천 태그 가져오기 (가장 많이 사용된 태그 5개)
  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase
        .from("posts")
        .select("tags");

      if (!error && data) {
        const allTags = data.flatMap(post => post.tags || []);
        const tagCounts = allTags.reduce((acc: any, tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {});

        const sortedTags = Object.keys(tagCounts)
          .sort((a, b) => tagCounts[b] - tagCounts[a])
          .slice(0, 5);

        setRecommendedTags(sortedTags);
      }
    }
    fetchTags();
  }, []);

  const handleSearch = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // 한글 입력 중 Enter를 누를 때 중복 처리를 방지하기 위해 isComposing 체크
      if (e.nativeEvent.isComposing) return;
      handleSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery("");
    handleSearch("");
  };

  return (
    <div className="relative w-full mb-8 group">
      <div
        className={cn(
          "relative flex items-center h-14 bg-white/5 border transition-all duration-500 rounded-sm overflow-hidden",
          isFocused ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/20 bg-white/10" : "border-white/10 hover:border-white/20"
        )}
      >
        <Search className={cn(
          "w-5 h-5 ml-5 transition-colors duration-500",
          isFocused ? "text-[var(--accent)]" : "text-gray-500"
        )} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            // 드롭다운 클릭을 처리하기 위해 약간의 지연
            setTimeout(() => setShowDropdown(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          className="flex-1 h-full bg-transparent border-none outline-none px-4 text-sm font-heading tracking-wider placeholder:text-gray-600 text-white"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="p-2 mr-3 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 추천 검색어 드롭다운 */}
      {showDropdown && recommendedTags.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-sm z-[60] shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4">
            <p className="text-[10px] font-heading tracking-[0.2em] uppercase text-gray-500 mb-3 px-2">
              {t.recommended}
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setQuery(tag);
                    handleSearch(tag);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[var(--accent)] hover:text-black border border-white/5 hover:border-[var(--accent)] rounded-full text-xs transition-all duration-300 group/tag"
                >
                  <Hash className="w-3 h-3 text-gray-500 group-hover/tag:text-black/50" />
                  <span className="font-medium">{tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
