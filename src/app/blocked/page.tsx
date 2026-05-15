import { Ban } from "lucide-react";
import Link from "next/link";

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <Ban className="w-10 h-10 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4 font-heading tracking-tight">계정이 차단되었습니다</h1>
      <p className="text-white/60 text-center max-w-md mb-8">
        귀하의 계정은 커뮤니티 가이드라인 위반으로 인해 활동이 정지되었습니다. 
        문의 사항이 있으시면 관리자에게 연락해 주세요.
      </p>

      <Link 
        href="/"
        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-colors uppercase text-sm tracking-widest"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
