"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

interface BookmarkButtonProps {
  postId: string;
  initialIsBookmarked: boolean;
  size?: "default" | "sm" | "icon" | "lg";
  variant?: "primary" | "ghost" | "ghostDark" | "accent" | "store";
  className?: string;
  iconClassName?: string;
}

export function BookmarkButton({
  postId,
  initialIsBookmarked,
  size = "icon",
  variant = "ghost",
  className,
  iconClassName,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const { user } = useAuth();

  useEffect(() => {
    setIsBookmarked(initialIsBookmarked);
  }, [postId, initialIsBookmarked]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    if (!user) {
      alert("Please log in to save posts.");
      return;
    }

    setIsLoading(true);
    
    // Optimistic Update
    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);

    try {
      if (newIsBookmarked) {
        const { error } = await supabase
          .from("bookmarks")
          .insert({ post_id: postId, user_id: user.id });
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      // Revert on error
      setIsBookmarked(!newIsBookmarked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={cn(
        "rounded-full transition-all duration-300 border-white/10",
        isBookmarked ? "text-yellow-500 hover:text-yellow-600 border-yellow-500/20" : "text-gray-400 hover:text-yellow-400 hover:border-yellow-400/20",
        className
      )}
    >
      <Bookmark 
        className={cn(
          "w-5 h-5 transition-transform duration-300",
          isBookmarked && "fill-current scale-110",
          isLoading && "opacity-50",
          iconClassName
        )} 
      />
    </Button>
  );
}
