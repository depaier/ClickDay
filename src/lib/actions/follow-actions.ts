"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 팔로우/언팔로우 토글 액션
 */
export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");
  if (user.id === targetUserId) throw new Error("자기 자신은 클릭할 수 없습니다.");

  // 이미 클릭(팔로우) 중인지 확인
  const { data: existingFollow } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (existingFollow) {
    // 언클릭 (언팔로우)
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);

    if (error) {
      console.error("Unclick error:", error);
      throw new Error("처리 중 오류가 발생했습니다.");
    }
  } else {
    // 클릭 (팔로우)
    const { error } = await supabase
      .from("follows")
      .insert({
        follower_id: user.id,
        following_id: targetUserId,
      });

    if (error) {
      console.error("Click error:", error);
      throw new Error("처리 중 오류가 발생했습니다.");
    }
  }

  // 데이터 갱신
  revalidatePath("/", "layout");
}

/**
 * 특정 사용자의 팔로우 상태를 확인
 */
export async function getFollowStatus(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: existingFollow } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  return !!existingFollow;
}

/**
 * 특정 사용자의 팔로워/팔로잉 숫자를 조회
 */
export async function getFollowCounts(userId: string) {
  const supabase = await createClient();

  const [followers, following] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId)
  ]);

  return {
    followersCount: followers.count || 0,
    followingCount: following.count || 0,
  };
}
