import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { EditPostForm } from "@/components/post/EditPostForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    return notFound();
  }

  // 작성자 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== post.user_id) {
    redirect(`/posts/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto pb-32">
      <EditPostForm post={post} />
    </div>
  );
}
