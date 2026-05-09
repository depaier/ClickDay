"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { Grid, Bookmark } from "lucide-react";

interface ProfileTabsProps {
  isOwnProfile: boolean;
}

export function ProfileTabs({ isOwnProfile }: ProfileTabsProps) {
  const { language } = useLanguage();
  const t = translations[language].profile;

  return (
    <div className="flex justify-center gap-12 font-heading tracking-widest uppercase text-sm border-b border-white/10 mb-8">
      <button className="flex items-center gap-2 pb-4 border-b-2 border-[var(--accent)] text-white">
        <Grid className="w-4 h-4" />
        {t.posts}
      </button>
      {isOwnProfile && (
        <button className="flex items-center gap-2 pb-4 text-gray-500 hover:text-white transition-colors">
          <Bookmark className="w-4 h-4" />
          {t.savedPosts}
        </button>
      )}
    </div>
  );
}
