"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  size?: "default" | "sm" | "icon" | "lg";
  variant?: "ghost" | "outline" | "accent";
  className?: string;
  showCount?: boolean;
}

export function LikeButton({
  postId,
  initialLikeCount,
  initialIsLiked,
  size = "icon",
  variant = "ghost",
  className,
  showCount = false,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in to like posts.");
      return;
    }

    setIsLoading(true);
    
    // Optimistic Update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (newIsLiked) {
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: user.id });
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikeCount(prev => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={variant}
        size={size}
        onClick={handleToggleLike}
        disabled={isLoading}
        className={cn(
          "rounded-full transition-all duration-300",
          isLiked && "text-red-500 hover:text-red-600",
          !isLiked && "text-white hover:text-red-400"
        )}
      >
        <Heart 
          className={cn(
            "w-5 h-5 transition-transform duration-300",
            isLiked && "fill-current scale-110",
            isLoading && "opacity-50"
          )} 
        />
      </Button>
      {showCount && (
        <span className="text-sm font-mono tracking-tighter text-gray-400">
          {likeCount}
        </span>
      )}
    </div>
  );
}
