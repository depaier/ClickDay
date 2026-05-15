"use client";

import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  MoreVertical,
  Clock,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { updateReportStatus } from "@/lib/actions/report-actions";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  created_at: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: 'pending' | 'resolved' | 'rejected';
  reporter: {
    username: string;
    avatar_url: string | null;
  };
}

export function ReportList({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [filter, setFilter] = useState('all');

  const handleStatusUpdate = async (id: string, status: 'resolved' | 'rejected') => {
    try {
      await updateReportStatus(id, status);
      setReports(reports.map(r => r.id === id ? { ...r, status } : r));
    } catch (error) {
      alert("상태 업데이트에 실패했습니다.");
    }
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          {['all', 'pending', 'resolved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                filter === s ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              {s === 'all' ? '전체' : s === 'pending' ? '대기 중' : s === 'resolved' ? '처리됨' : '기각됨'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">신고자</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">신고 대상</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">사유</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">날짜</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">상태</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 text-right">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                      {report.reporter.avatar_url && (
                        <img src={report.reporter.avatar_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{report.reporter.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      report.target_type === 'post' ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                    )}>
                      {report.target_type}
                    </span>
                    <Link 
                      href={report.target_type === 'post' ? `/posts/${report.target_id}` : `/users/@${report.target_id}`}
                      target="_blank"
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-white/90">{report.reason}</span>
                    {report.details && (
                      <span className="text-xs text-white/40 mt-1 line-clamp-1">{report.details}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-white/40">
                  {format(new Date(report.created_at), 'MM/dd HH:mm')}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    report.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" :
                    report.status === 'resolved' ? "bg-emerald-500/10 text-emerald-500" :
                    "bg-red-500/10 text-red-500"
                  )}>
                    {report.status === 'pending' && <Clock className="w-3 h-3" />}
                    {report.status === 'resolved' && <ShieldCheck className="w-3 h-3" />}
                    {report.status === 'rejected' && <ShieldAlert className="w-3 h-3" />}
                    {report.status === 'pending' ? '대기 중' : report.status === 'resolved' ? '처리됨' : '기각됨'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {report.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        className="p-2 hover:bg-emerald-500/10 text-white/40 hover:text-emerald-500 rounded-lg transition-colors"
                        title="처리 완료"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'rejected')}
                        className="p-2 hover:bg-red-500/10 text-white/40 hover:text-red-500 rounded-lg transition-colors"
                        title="신고 기각"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-white/20 italic px-2">처리 완료</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredReports.length === 0 && (
          <div className="p-20 text-center text-white/20">
            신고 내역이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
