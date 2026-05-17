import { getAllPosts } from "@/lib/actions/admin-actions";
import { AdminPostList } from "@/components/admin/AdminPostList";

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">게시물 관리</h2>
        <p className="text-white/60 mt-2">서비스에 업로드된 모든 사진과 위치 정보를 모니터링하고 관리합니다.</p>
      </div>

      <AdminPostList initialPosts={posts} />
    </div>
  );
}
