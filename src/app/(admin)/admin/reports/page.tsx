import { getReports } from "@/lib/actions/report-actions";
import { ReportList } from "@/components/admin/ReportList";

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const reports = await getReports();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">신고 관리</h2>
        <p className="text-white/60 mt-2">사용자들이 제출한 신고 내역을 검토하고 처리합니다.</p>
      </div>

      <ReportList initialReports={reports} />
    </div>
  );
}
