"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertTriangle, 
  Settings,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "대시보드", href: "/admin" },
  { icon: AlertTriangle, label: "신고 관리", href: "/admin/reports" },
  { icon: Users, label: "사용자 관리", href: "/admin/users" },
  { icon: FileText, label: "게시물 관리", href: "/admin/posts" },
  { icon: Settings, label: "설정", href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#111111] border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">메인으로 돌아가기</span>
        </Link>
        
        <Link href="/admin" className="block mb-10 px-2 transition-opacity hover:opacity-80">
          <img 
            src="/Adminlogo.svg" 
            alt="ClickDay Admin" 
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-white text-[#0a0a0a] shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-[#0a0a0a]" : "text-white/40 group-hover:text-white"
                )} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Administrator</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">System Root</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
