import { ProfileSkeleton } from "@/components/skeleton";
import { queryMyProfile } from "@/entities/user";
import { ProfileUpdateForm } from "@/features/profile/update";
import { createClient } from "@/shared/api/supabase/server";
import { CustomUserAuth } from "@/shared/lib/auth";
import { Button } from "@/shared/shadcn/ui/button";
import { ArrowLeft, Link } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function ProfileEditPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileEditLoader />
    </Suspense>
  );
}

async function ProfileEditLoader() {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);
  const currentUser = await queryMyProfile(supabase, user.id);
  if (!currentUser.ok) {
    redirect("/login");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4 gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              프로필로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mx-2">프로필 수정</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 mx-4">회원 정보를 수정할 수 있습니다</p>
        </div>
        <ProfileUpdateForm useData={currentUser.value} />
      </div>
    </div>
  )
}