"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { translations } from "@/constants/translations";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { UserMenu } from "./UserMenu";

export function Navbar({ variant = "sticky" }: { variant?: "transparent" | "sticky" }) {
  const { language } = useLanguage();
  const t = translations[language].nav;
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "h-[60px] w-full flex items-center justify-between px-5 font-heading text-[12px] font-normal tracking-[0.167em] uppercase z-50 transition-colors duration-300",
          variant === "transparent" ? "absolute top-0 text-white bg-black" : "bg-black text-white sticky top-0"
        )}
      >
        {/* Left Menu / Brand */}
        <div className="flex items-center gap-6">
          <button 
            className="md:hidden hover:text-[var(--accent)] transition-colors"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center">
            <Image 
              src="/logo.svg" 
              alt="ClickDay" 
              width={140} 
              height={18} 
              className="h-5 w-auto" 
              priority
            />
          </Link>
        </div>

        {/* Center Nav Links - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: "/", label: t.home },
            { href: "/feed", label: t.feed },
            { href: "/upload", label: t.upload },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative py-1 transition-colors duration-300 hover:text-[var(--accent)]",
                isActive(link.href) ? "text-[var(--accent)]" : "text-white/70"
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div
                  layoutId="nav-underline"
                  layoutDependency={pathname}
                  initial={false}
                  className="absolute bottom-0 left-0 right-[0.167em] h-[1px] bg-[var(--accent)]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
            </Link>
          ))}
        </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-6">
        <LanguageSwitcher />
        
        {user ? (
          <UserMenu />
        ) : (
          <Link href="/login" className="hover:text-[var(--accent)] transition-colors">{t.login}</Link>
        )}
      </div>
    </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center gap-8 md:hidden"
          >
            <motion.button 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-5 left-5 text-white hover:text-[var(--accent)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </motion.button>

            {[
              { href: "/", label: t.home },
              { href: "/feed", label: t.feed },
              { href: "/upload", label: t.upload },
            ].map((link, idx) => (
              <motion.div
                key={link.href}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "text-xl font-heading tracking-[0.2em] transition-colors uppercase",
                    isActive(link.href) ? "text-[var(--accent)]" : "text-white hover:text-[var(--accent)]"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 pt-8 border-t border-white/10 w-24 flex justify-center"
            >
              <LanguageSwitcher />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
