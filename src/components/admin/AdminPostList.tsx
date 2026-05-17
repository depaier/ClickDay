"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  FileText, 
  Trash2, 
  ExternalLink, 
  MapPin,
  Camera,
  Search
} from "lucide-react";
import { deletePostAdmin } from "@/lib/actions/admin-actions";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Post {
  id: string;
  image_url: string;
  title: string | null;
  location_name: string | null;
  created_at: string;
  author: {
    username: string;
    avatar_url: string | null;
  };
  camera_model: string | null;
  region: string | null;
}

export function AdminPostList({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState("");

  const handleDelete = async (postId: string) => {
    if (!confirm("이 게시물을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      await deletePostAdmin(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      alert("게시물 삭제에 실패했습니다.");
    }
  };

  const filteredPosts = posts.filter(p => 
    (p.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (p.location_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    p.author.username.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="위치, 작성자, 또는 ID로 검색..."
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
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">미리보기</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">위치 / 정보</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">작성자</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">날짜</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 text-right">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPosts.map((post) => (
              <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                    <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="font-bold text-sm text-white/90">
                      {post.title || post.location_name || '제목 없음'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <MapPin className="w-3 h-3 text-[var(--accent)]" />
                      {post.region || '위치 정보 없음'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider">
                      <Camera className="w-3 h-3" />
                      {post.camera_model || '기기 정보 없음'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-white/60">
                  @{post.author.username}
                </td>
                <td className="px-6 py-4 text-sm text-white/40">
                  {format(new Date(post.created_at), 'yyyy/MM/dd HH:mm')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/?selected=${post.id}`}
                      target="_blank"
                      className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-colors"
                      title="게시물 보기"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 hover:bg-red-500/10 text-white/40 hover:text-red-500 rounded-lg transition-colors"
                      title="게시물 삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPosts.length === 0 && (
          <div className="p-20 text-center text-white/20">
            게시물을 찾을 수 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
