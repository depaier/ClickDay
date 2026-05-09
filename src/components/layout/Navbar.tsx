"use client";

import React from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { cn } from "../ui/Button";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { translations } from "@/constants/translations";

export function Navbar({ variant = "sticky" }: { variant?: "transparent" | "sticky" }) {
  const { language } = useLanguage();
  const t = translations[language].nav;
  const { user, signOut } = useAuth();

  return (
    <nav
      className={cn(
        "h-[60px] w-full flex items-center justify-between px-5 font-heading text-[12px] font-normal tracking-[0.167em] uppercase z-50 transition-colors duration-300",
        variant === "transparent" ? "absolute top-0 text-white bg-black" : "bg-black text-white sticky top-0"
      )}
    >
      {/* Left Menu / Brand */}
      <div className="flex items-center gap-6">
        <button className="hover:text-[var(--accent)] transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="font-heading font-bold tracking-[0.2em] text-lg hover:text-[var(--accent)] transition-colors">
          CLICKDAY
        </Link>
      </div>

      {/* Center Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/feed" className="hover:text-[var(--accent)] transition-colors">{t.feed}</Link>
        <Link href="/upload" className="hover:text-[var(--accent)] transition-colors">{t.upload}</Link>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-6">
        <LanguageSwitcher />
        <button className="hover:text-[var(--accent)] transition-colors">
          <Search className="w-5 h-5" />
        </button>
        
        {user ? (
          <div className="flex items-center gap-6">
            <Link href="/profile" className="hover:text-[var(--accent)] transition-colors">{t.profile}</Link>
            <button 
              onClick={() => signOut()}
              className="hover:text-[var(--accent)] transition-colors uppercase"
            >
              {t.logout}
            </button>
          </div>
        ) : (
          <Link href="/login" className="hover:text-[var(--accent)] transition-colors">{t.login}</Link>
        )}
      </div>
    </nav>
  );
}
