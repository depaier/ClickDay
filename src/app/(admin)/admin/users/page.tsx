import { getUsers } from "@/lib/actions/admin-actions";
import { UserList } from "@/components/admin/UserList";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">사용자 관리</h2>
        <p className="text-white/60 mt-2">서비스의 모든 사용자 정보를 확인하고 권한을 관리합니다.</p>
      </div>

      <UserList initialUsers={users} />
    </div>
  );
}
