"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { toggleFollow } from "@/lib/actions/follow-actions";
import { cn } from "@/lib/utils";
import { UserPlus, UserCheck, UserMinus, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  className?: string;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  className,
}: FollowButtonProps) {
  const { language } = useLanguage();
  const t = translations[language].profile;
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isHovered, setIsHovered] = useState(false);
  const [isPending, startTransition] = useTransition();

  // props가 변경될 때 상태 동기화 (예: 다른 페이지로 이동 시)
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing, targetUserId]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    // 낙관적 업데이트 (Optimistic UI)
    const prevStatus = isFollowing;
    setIsFollowing(!prevStatus);

    startTransition(async () => {
      try {
        await toggleFollow(targetUserId);
      } catch (error: any) {
        // 에러 발생 시 원복
        setIsFollowing(prevStatus);
        alert(error.message || "오류가 발생했습니다.");
      }
    });
  };

  return (
    <Button
      variant={isFollowing ? "ghost" : "accent"}
      size="sm"
      onClick={handleFollow}
      disabled={isPending}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "text-xs h-8 px-4 rounded-full transition-all duration-300 min-w-[100px]",
        isFollowing 
          ? "border-white/10 text-gray-400 hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/5" 
          : "bg-[var(--accent)] text-black font-bold hover:opacity-90 hover:scale-105",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
      ) : isFollowing ? (
        isHovered ? (
          <UserMinus className="w-3 h-3 mr-1.5" />
        ) : (
          <UserCheck className="w-3 h-3 mr-1.5" />
        )
      ) : (
        <UserPlus className="w-3 h-3 mr-1.5" />
      )}
      
      {isFollowing 
        ? (isHovered ? t.unclick : t.following) 
        : t.follow
      }
    </Button>
  );
}
