"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  User, 
  Shield, 
  ShieldAlert, 
  Ban, 
  CheckCircle,
  MoreVertical,
  Search
} from "lucide-react";
import { updateUserRole, toggleUserBlock } from "@/lib/actions/admin-actions";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  role: 'user' | 'admin';
  is_blocked: boolean;
  created_at: string;
}

export function UserList({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`사용자의 권한을 ${newRole}로 변경하시겠습니까?`)) return;

    try {
      await updateUserRole(userId, newRole as 'user' | 'admin');
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as 'user' | 'admin' } : u));
    } catch (error) {
      alert("권한 변경에 실패했습니다.");
    }
  };

  const handleBlockToggle = async (userId: string, currentBlocked: boolean) => {
    const newBlocked = !currentBlocked;
    if (!confirm(`사용자를 ${newBlocked ? '차단' : '차단 해제'}하시겠습니까?`)) return;

    try {
      await toggleUserBlock(userId, newBlocked);
      setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: newBlocked } : u));
    } catch (error) {
      alert("차단 상태 변경에 실패했습니다.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="사용자명 또는 ID로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">사용자</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">역할</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">가입일</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">상태</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 text-right">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/5">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white/20" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-white/30 font-mono">
                  {user.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    user.role === 'admin' ? "bg-indigo-500/10 text-indigo-400" : "bg-white/5 text-white/40"
                  )}>
                    {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-white/40">
                  {format(new Date(user.created_at), 'yyyy/MM/dd')}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    user.is_blocked ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {user.is_blocked ? '차단됨' : '정상'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleRoleToggle(user.id, user.role)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        user.role === 'admin' ? "text-indigo-400 hover:bg-indigo-500/10" : "text-white/40 hover:text-white hover:bg-white/10"
                      )}
                      title="역할 변경"
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleBlockToggle(user.id, user.is_blocked)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        user.is_blocked ? "text-red-500 hover:bg-red-500/10" : "text-white/40 hover:text-red-500 hover:bg-red-500/10"
                      )}
                      title={user.is_blocked ? "차단 해제" : "사용자 차단"}
                    >
                      {user.is_blocked ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-20 text-center text-white/20">
            사용자를 찾을 수 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

import { ShieldCheck } from "lucide-react";
