import { ProfileSkeleton } from "@/shared/ui/skeleton";
import { queryMyProfile } from "@/entities/user";
import { PasswordChangeForm } from "@/features/auth/change-password";
import { createClient } from "@/shared/api/supabase/server";
import { CustomUserAuth } from "@/shared/lib/auth";
import { Button } from "@/shared/shadcn/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
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
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4 gap-2 bg-transparent text-ink hover:bg-ink/5 hover:text-ink">
              <ArrowLeft className="w-4 h-4" />
              프로필로 돌아가기
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink">
              <Lock className="w-6 h-6 text-paper" />
            </div>
            <h1 className="font-heading text-3xl font-normal text-ink">비밀번호 변경</h1>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            보안을 위해 정기적으로 비밀번호를 변경해주세요
          </p>
        </div>
        <PasswordChangeForm />
      </div>
    </div>
  )

}