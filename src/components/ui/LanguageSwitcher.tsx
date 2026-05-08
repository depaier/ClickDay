"use client";

import React from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 text-xs font-heading tracking-widest uppercase">
      <button
        onClick={() => setLanguage("en")}
        className={`transition-colors hover:text-[var(--accent)] ${
          language === "en" ? "text-[var(--accent)] font-bold" : "text-gray-400"
        }`}
      >
        EN
      </button>
      <span className="text-gray-600">|</span>
      <button
        onClick={() => setLanguage("ko")}
        className={`transition-colors hover:text-[var(--accent)] ${
          language === "ko" ? "text-[var(--accent)] font-bold" : "text-gray-400"
        }`}
      >
        KO
      </button>
    </div>
  );
}
