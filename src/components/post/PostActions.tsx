"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Edit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "../providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { DeletePostButton } from "./DeletePostButton";
import { motion, AnimatePresence } from "framer-motion";

interface PostActionsProps {
  postId: string | number;
  imageUrl?: string;
  className?: string;
  iconClassName?: string;
}

export function PostActions({ postId, imageUrl, className, iconClassName }: PostActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const t = translations[language].post;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="More actions"
      >
        <MoreHorizontal className={cn("w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-white", iconClassName)} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-md shadow-2xl z-[100] overflow-hidden"
          >
            <div className="flex flex-col py-1">
              <Link 
                href={`/posts/${postId}/edit`}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Edit className="w-4 h-4" />
                {t.edit}
              </Link>
              <div className="border-t border-white/5 mx-2" />
              <div onClick={() => setIsOpen(false)}>
                <DeletePostButton 
                  postId={postId} 
                  imageUrl={imageUrl} 
                  variant="menu"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
