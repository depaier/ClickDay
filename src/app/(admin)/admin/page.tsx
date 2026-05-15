import { getAdminStats, getAdminChartData, getAdminTagStats, getAdminCategoryStats } from "@/lib/actions/admin-actions";
import { cn } from "@/lib/utils";
import { ActivityChart, TagChart, DistributionChart } from "@/components/admin/AdminCharts";
import { Users, Image as ImageIcon, AlertTriangle, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [stats, activityData, tagData, categoryStats] = await Promise.all([
    getAdminStats(),
    getAdminChartData(),
    getAdminTagStats(),
    getAdminCategoryStats()
  ]);

  const summaryStats = [
    { label: "전체 사용자", value: stats.userCount.toLocaleString(), color: "from-blue-500/20 to-blue-500/5", icon: Users, iconColor: "text-blue-500" },
    { label: "전체 게시물", value: stats.postCount.toLocaleString(), color: "from-purple-500/20 to-purple-500/5", icon: ImageIcon, iconColor: "text-purple-500" },
    { label: "대기 중인 신고", value: stats.pendingReports.toLocaleString(), color: "from-red-500/20 to-red-500/5", icon: AlertTriangle, iconColor: "text-red-500" },
    { label: "오늘의 게시물", value: stats.todayPosts.toLocaleString(), color: "from-green-500/20 to-green-500/5", icon: Calendar, iconColor: "text-green-500" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">대시보드</h2>
          <p className="text-white/40 mt-2">ClickDay의 실시간 현황을 분석합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <div key={stat.label} className={cn(
            "relative overflow-hidden bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group"
          )}>
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br opacity-10 blur-2xl rounded-full", stat.color)} />
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-white/40 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
              </div>
              <div className={cn("p-2 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform", stat.iconColor)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">활동 추이</h3>
            <p className="text-xs text-white/40">최근 7일</p>
          </div>
          <div className="h-[300px]">
            <ActivityChart data={activityData} />
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">인기 태그</h3>
            <p className="text-xs text-white/40">Top 10</p>
          </div>
          <div className="h-[300px]">
            <TagChart data={tagData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl pt-6 h-[350px]">
          <DistributionChart data={categoryStats.brands} title="카메라 브랜드 분포" />
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl pt-6 h-[350px]">
          <DistributionChart data={categoryStats.regions} title="지역별 업로드 분포" />
        </div>
      </div>
    </div>
  );
}

