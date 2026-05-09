"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";

interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export function ProfileStats({
  postsCount,
  followersCount,
  followingCount,
}: ProfileStatsProps) {
  const { language } = useLanguage();
  const t = translations[language].profile;

  return (
    <div className="flex justify-center md:justify-start gap-8 mb-4 font-heading tracking-wider uppercase text-sm">
      <div>
        <span className="font-bold mr-1">{postsCount}</span>{" "}
        <span className="text-gray-400">{t.posts}</span>
      </div>
      <div>
        <span className="font-bold mr-1">{followersCount}</span>{" "}
        <span className="text-gray-400">{t.followers}</span>
      </div>
      <div>
        <span className="font-bold mr-1">{followingCount}</span>{" "}
        <span className="text-gray-400">{t.following}</span>
      </div>
    </div>
  );
}
