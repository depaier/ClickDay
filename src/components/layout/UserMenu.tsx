"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../providers/AuthProvider";
import { useLanguage } from "../providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const { language } = useLanguage();
  const t = translations[language].nav;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || user.id}`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group p-1 rounded-full hover:bg-white/5 transition-all duration-300"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-[var(--accent)] transition-colors shadow-lg">
          <img 
            src={avatarUrl} 
            alt="avatar" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        </div>
        <ChevronDown 
          className={cn(
            "w-3 h-3 text-gray-500 group-hover:text-white transition-all duration-300",
            isOpen && "rotate-180 text-white"
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close menu on mobile/background */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-3 w-56 bg-[#0c0c0c] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-2xl"
            >
              <div className="p-4 border-b border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] mb-1 font-heading">Signed in as</p>
                <p 
                  className="text-sm font-bold truncate text-white font-heading tracking-wide"
                  style={{ textTransform: 'none' }}
                >
                  {profile?.username || user.email?.split('@')[0]}
                </p>
              </div>
              
              <div className="py-2">
                <Link
                  href={`/users/@${profile?.username || user.id}`}
                  className="flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white transition-all group/item"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4 text-gray-500 group-hover/item:text-[var(--accent)] transition-colors" />
                  {t.profile}
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white transition-all group/item"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4 text-gray-500 group-hover/item:text-[var(--accent)] transition-colors" />
                  {t.settings}
                </Link>

                {profile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest text-[var(--accent)]/80 hover:bg-[var(--accent)]/5 hover:text-[var(--accent)] transition-all group/item"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-4 h-4 text-[var(--accent)]/50 group-hover/item:text-[var(--accent)] transition-colors" />
                    Admin Dashboard
                  </Link>
                )}
                
                <div className="border-t border-white/5 my-2 mx-2" />
                
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest text-red-500/80 hover:bg-red-500/5 hover:text-red-400 transition-all text-left group/logout"
                >
                  <LogOut className="w-4 h-4 text-red-900/50 group-hover/logout:text-red-500 transition-colors" />
                  {t.logout}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
