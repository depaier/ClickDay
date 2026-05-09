"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

function FilterChipsContent() {
  const { language } = useLanguage();
  const t = translations[language].feed.filters;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentFilter = searchParams.get("filter") || "all";

  const filters = [
    { id: "all", label: t.all },
    { id: "clicking", label: t.clicking },
  ];

  const handleFilterClick = (filterId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterId === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filterId);
    }
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-3 overflow-x-auto py-4 no-scrollbar -mx-5 px-5 scroll-smooth mb-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleFilterClick(filter.id)}
          className={cn(
            "px-5 py-1.5 rounded-full text-[9px] font-heading tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-500 border",
            currentFilter === filter.id
              ? "bg-[var(--accent)] border-[var(--accent)] text-black font-bold scale-110"
              : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-white/30 hover:bg-white/10"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export function FilterChips() {
  return (
    <Suspense fallback={<div className="h-10 w-full animate-pulse bg-white/5 rounded-full mb-6" />}>
      <FilterChipsContent />
    </Suspense>
  );
}
