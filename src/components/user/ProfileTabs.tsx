"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { Grid, Bookmark } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";


interface ProfileTabsProps {
  isOwnProfile: boolean;
}

export function ProfileTabs({ isOwnProfile }: ProfileTabsProps) {
  const { language } = useLanguage();
  const t = translations[language].profile;
  const router = useRouter();

  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "posts";

  const handleTabChange = (tab: string) => {
    router.push(`?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="flex justify-center gap-12 font-heading tracking-widest uppercase text-sm border-b border-white/10 mb-8">
      <button 
        onClick={() => handleTabChange("posts")}
        className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
          activeTab === "posts" 
            ? "border-[var(--accent)] text-white" 
            : "border-transparent text-gray-500 hover:text-white"
        }`}
      >
        <Grid className="w-4 h-4" />
        {t.posts}
      </button>
      {isOwnProfile && (
        <button 
          onClick={() => handleTabChange("saved")}
          className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
            activeTab === "saved" 
              ? "border-[var(--accent)] text-white" 
              : "border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          {t.savedPosts}
        </button>
      )}
    </div>
  );

}
