"use client";

import Link from "next/link";

import { SignupForm } from "@/features/auth/signup";
import { Card } from "@/shared/shadcn/ui/card";

export default function SignupCard() {
  

  return (
    <>
        {/* 회원가입 폼 카드 */}
        <Card className="bg-paper border-2 border-ink/15 shadow-soft p-6">
          <h2 className="mb-6 font-heading text-xl font-normal text-ink">
            회원가입
          </h2>

         <SignupForm />
        </Card>

        {/* 로그인 링크 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-ink-soft">
            이미 회원이신가요?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-ink hover:text-ink/60"
            >
              로그인하기
            </Link>
          </p>
        </div>

  </>
  );
}
