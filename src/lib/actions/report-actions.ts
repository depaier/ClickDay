"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ReportTargetType = 'post' | 'comment' | 'profile';

interface CreateReportParams {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}

/**
 * 콘텐츠 신고 생성 액션 (중복 확인 및 횟수 제한 포함)
 */
export async function createReport({
  targetType,
  targetId,
  reason,
  details,
}: CreateReportParams) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  // 1. 중복 신고 확인
  const { data: existingReport } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (existingReport) {
    throw new Error("ALREADY_REPORTED");
  }

  // 2. 일일 신고 횟수 제한 확인 (오늘 00:00:00 이후 신고 내역)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error: countError } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("reporter_id", user.id)
    .gte("created_at", today.toISOString());

  if (countError) {
    console.error("Count error:", countError);
  }

  if (count !== null && count >= 3) {
    throw new Error("LIMIT_REACHED");
  }

  // 3. 신고 삽입
  const { error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      details,
      status: 'pending',
    });

  if (error) {
    console.error("Report error:", error);
    throw new Error("ERROR");
  }

  // 데이터 갱신
  revalidatePath("/", "layout");

  return { success: true };
}

/**
 * 특정 사용자가 특정 콘텐츠를 이미 신고했는지 확인
 */
export async function getReportStatus(targetType: ReportTargetType, targetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: existingReport } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  return !!existingReport;
}
