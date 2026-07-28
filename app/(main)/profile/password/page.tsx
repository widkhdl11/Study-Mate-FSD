import { ProfileSkeleton } from "@/components/skeleton";
import { queryMyProfile } from "@/entities/user";
import { PasswordChangeForm } from "@/features/auth/change-password";
import { createClient } from "@/shared/api/supabase/server";
import { CustomUserAuth } from "@/shared/lib/auth";
import { Button } from "@/shared/shadcn/ui/button";
import { ArrowLeft, Link, Lock } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function PasswordChangePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <PasswordChangeLoader />
    </Suspense>
  );
}

async function PasswordChangeLoader() {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);
  const currentUser = await queryMyProfile(supabase, user.id);
  if (!currentUser.ok) {
    redirect("/login");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4 gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              프로필로 돌아가기
            </Button>
          </Link>
          <div className="flex items-center gap-3 mx-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">비밀번호 변경</h1>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 mx-4">
            보안을 위해 정기적으로 비밀번호를 변경해주세요
          </p>
        </div>
        <PasswordChangeForm />
      </div>
    </div>
  )

}