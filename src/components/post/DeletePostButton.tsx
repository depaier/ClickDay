"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useAlertStore } from "@/store/useAlertStore";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";



interface DeletePostButtonProps {
  postId: string | number;
  imageUrl?: string;
  variant?: "default" | "menu";
}

export function DeletePostButton({ postId, imageUrl, variant = "default" }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { showToast, showConfirm } = useAlertStore();
  
  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const confirmed = await showConfirm({
      title: t.post.delete,
      message: t.post.deleteConfirm,
      confirmLabel: t.common.delete,
      cancelLabel: t.common.cancel,
      confirmVariant: 'danger'
    });


    if (!confirmed) return;


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

      showToast({
        message: t.post.deleteSuccess,
        type: "success"
      });

      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error("Delete error:", error);
      showToast({
        message: error.message || t.common.error,
        type: "error"
      });

    } finally {

      setIsDeleting(false);
    }
  };

  if (variant === "menu") {
    return (
      <button 
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4" /> 
        {isDeleting ? translations[language].settings.saving : t.post.delete}
      </button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      className="w-full h-12 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 border-red-900/50 hover:border-red-500 transition-all"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4" /> {isDeleting ? translations[language].settings.saving : t.post.delete}
    </Button>
  );
}
