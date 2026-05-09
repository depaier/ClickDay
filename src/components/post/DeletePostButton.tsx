"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

interface DeletePostButtonProps {
  postId: string | number;
  imageUrl?: string;
}

export function DeletePostButton({ postId, imageUrl }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      // 1. Storage에서 이미지 삭제 (URL에서 파일명 추출 필요)
      if (imageUrl) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const { error: storageError } = await supabase.storage
          .from('clickday')
          .remove([fileName]);
        
        if (storageError) {
          console.warn("Could not delete image from storage:", storageError);
        }
      }

      // 2. DB에서 레코드 삭제
      const { error: dbError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (dbError) throw dbError;

      alert("Post deleted successfully.");
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(error.message || "Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      className="w-full h-12 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 border-red-900/50 hover:border-red-500 transition-all"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4" /> {isDeleting ? "Deleting..." : "Delete Post"}
    </Button>
  );
}
