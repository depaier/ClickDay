"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
  const supabase = await createClient();
  
  // 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (profile?.role !== 'admin') throw new Error("Forbidden");

  // 1. 전체 사용자 수
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: 'exact', head: true });

  // 2. 전체 게시물 수
  const { count: postCount } = await supabase
    .from("posts")
    .select("*", { count: 'exact', head: true });

  // 3. 대기 중인 신고 수
  const { count: pendingReports } = await supabase
    .from("reports")
    .select("*", { count: 'exact', head: true })
    .eq("status", "pending");

  // 4. 오늘의 방문자 (간단히 오늘 생성된 세션 등으로 대체하거나 Mock)
  // 여기서는 오늘 생성된 게시물 수로 대체해 보겠습니다.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayPosts } = await supabase
    .from("posts")
    .select("*", { count: 'exact', head: true })
    .gte("created_at", today.toISOString());

  return {
    userCount: userCount || 0,
    postCount: postCount || 0,
    pendingReports: pendingReports || 0,
    todayPosts: todayPosts || 0
  };
}

/**
 * [Admin] 최근 7일간의 추이 데이터 가져오기
 */
export async function getAdminChartData() {
  const supabase = await createClient();
  
  // 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (profile?.role !== 'admin') throw new Error("Forbidden");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // 사용자 가입 추이
  const { data: usersData } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  // 게시물 업로드 추이
  const { data: postsData } = await supabase
    .from("posts")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  // 날짜별로 그룹화
  const statsMap: Record<string, { date: string, users: number, posts: number }> = {};
  
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    statsMap[dateStr] = { date: dateStr, users: 0, posts: 0 };
  }

  usersData?.forEach(u => {
    const dateStr = u.created_at.split('T')[0];
    if (statsMap[dateStr]) statsMap[dateStr].users++;
  });

  postsData?.forEach(p => {
    const dateStr = p.created_at.split('T')[0];
    if (statsMap[dateStr]) statsMap[dateStr].posts++;
  });

  return Object.values(statsMap).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * [Admin] 인기 태그 통계
 */
export async function getAdminTagStats() {
  const supabase = await createClient();
  
  const { data: posts } = await supabase
    .from("posts")
    .select("tags");

  const tagCounts: Record<string, number> = {};
  posts?.forEach(post => {
    post.tags?.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * [Admin] 카테고리별(브랜드/지역) 통계
 */
export async function getAdminCategoryStats() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("camera_brand, region");

  const brandCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {};

  posts?.forEach(post => {
    if (post.camera_brand) {
      brandCounts[post.camera_brand] = (brandCounts[post.camera_brand] || 0) + 1;
    }
    if (post.region) {
      regionCounts[post.region] = (regionCounts[post.region] || 0) + 1;
    }
  });

  const formatStats = (counts: Record<string, number>) => 
    Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

  return {
    brands: formatStats(brandCounts),
    regions: formatStats(regionCounts)
  };
}

/**
 * [Admin] 전체 사용자 목록 가져오기
 */
export async function getUsers() {
  const supabase = await createClient();
  
  // 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (profile?.role !== 'admin') throw new Error("Forbidden");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch users error:", error);
    throw new Error("Failed to fetch users");
  }

  return data;
}

/**
 * [Admin] 사용자 역할 변경
 */
export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const supabase = await createClient();
  
  // 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (profile?.role !== 'admin') throw new Error("Forbidden");

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select();

  if (error || !data || data.length === 0) {
    console.error("Update role error:", error);
    throw new Error("Failed to update role");
  }
  
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * [Admin] 사용자 차단 상태 토글
 */
export async function toggleUserBlock(userId: string, isBlocked: boolean) {
  const supabase = await createClient();

  // 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (profile?.role !== 'admin') throw new Error("Forbidden");

  const { data, error } = await supabase
    .from("profiles")
    .update({ is_blocked: isBlocked })
    .eq("id", userId)
    .select();

  if (error || !data || data.length === 0) {
    console.error("Update block status error:", error);
    throw new Error("Failed to update block status");
  }
  
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * [Admin] 모든 게시물 목록 가져오기
 */
export async function getAllPosts() {
  const supabase = await createClient();
  
  // 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (profile?.role !== 'admin') throw new Error("Forbidden");

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(username, avatar_url)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch posts error:", error);
    throw new Error("Failed to fetch posts");
  }

  return data;
}

/**
 * [Admin] 게시물 강제 삭제
 */
export async function deletePostAdmin(postId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) throw new Error("Failed to delete post");
  
  revalidatePath("/admin/posts");
  revalidatePath("/", "layout");
  return { success: true };
}

