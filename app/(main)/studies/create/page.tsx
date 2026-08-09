import { StudyCreateForm } from "@/features/study/create";
import { Button } from "@/shared/shadcn/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StudyCreatePage() {
    return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/30 to-background px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* 작업용 헤더 (edit·password 페이지와 동일 패턴) */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              홈으로
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">스터디 만들기</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            함께할 스터디를 만들고 멤버를 모아보세요
          </p>
        </div>
        <StudyCreateForm />
      </div>
    </div>
  );
}
