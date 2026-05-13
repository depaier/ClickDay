"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Hash } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { TranslationKeys, translations } from "@/constants/translations";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function SearchBar() {
  const { language } = useLanguage();
  const t = (translations[language] as TranslationKeys).feed.search;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [prevQ, setPrevQ] = useState(searchParams.get("q") || "");
  const [isFocused, setIsFocused] = useState(false);
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // URL 파라미터가 외부(뒤로가기 등)에서 변경되었을 때 로컬 상태 동기화
  const currentQ = searchParams.get("q") || "";
  if (currentQ !== prevQ) {
    setPrevQ(currentQ);
    setQuery(currentQ);
  }

  // 최근 검색어 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    async function fetchTags() {
      const { data, error } = await supabase
        .from("posts")
        .select("tags")
        .not("tags", "is", null)
        .order("created_at", { ascending: false })
        .limit(200);
      
      if (!error && data) {
        const allTags = data.flatMap((post: { tags: string[] | null }) => post.tags || []);
        const tagCounts = allTags.reduce((acc: Record<string, number>, tag: string) => {
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

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(t => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleSearch = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set("q", searchTerm);
      saveSearch(searchTerm);
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // 한글 입력 중 Enter를 누를 때 중복 처리를 방지하기 위해 isComposing 체크
      if ((e.nativeEvent as KeyboardEvent).isComposing) return;
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

      {/* 추천 및 최근 검색어 드롭다운 */}
      {showDropdown && (recommendedTags.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-sm z-[60] shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* 최근 검색어 */}
            {recentSearches.length > 0 && (
              <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/5">
                <div className="flex justify-between items-center mb-3 px-2">
                  <p className="text-[10px] font-heading tracking-[0.2em] uppercase text-gray-500">
                    {language === 'ko' ? '최근 검색어' : 'Recent Searches'}
                  </p>
                  <button 
                    onClick={clearAllRecent}
                    className="text-[9px] text-gray-600 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    {language === 'ko' ? '모두 삭제' : 'Clear All'}
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        handleSearch(term);
                      }}
                      className="group/item flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-sm cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-3 h-3 text-gray-600" />
                        <span className="text-xs text-gray-300">{term}</span>
                      </div>
                      <button
                        onClick={(e) => removeRecentSearch(e, term)}
                        className="p-1 opacity-0 group-hover/item:opacity-100 hover:text-[var(--accent)] transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 추천 태그 */}
            {recommendedTags.length > 0 && (
              <div className="flex-1 p-4">
                <p className="text-[10px] font-heading tracking-[0.2em] uppercase text-gray-500 mb-3 px-2">
                  {t.recommended}
                </p>
                <div className="flex flex-wrap gap-2 px-2">
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
