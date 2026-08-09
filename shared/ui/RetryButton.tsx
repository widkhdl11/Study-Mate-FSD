"use client";

import { Button } from "@/shared/shadcn/ui/button";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * 서버 컴포넌트 로드 실패 시 인라인 재시도 버튼.
 * router.refresh()로 서버 컴포넌트를 다시 실행한다(404로 튕기지 않고 제자리 재시도).
 */
export function RetryButton({ label = "다시 시도" }: { label?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      className="gap-2"
    >
      <RotateCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "다시 불러오는 중..." : label}
    </Button>
  );
}
