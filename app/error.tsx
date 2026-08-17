"use client";

import { Button } from "@/shared/shadcn/ui/button";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-3xl">😢</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink">
            문제가 발생했습니다
          </h2>
          <p className="text-ink-soft mt-2 max-w-md">
            {error.message || "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={reset} className="bg-ink text-paper hover:bg-ink/90 active:scale-[0.97]">
            다시 시도
          </Button>
          <Button onClick={() => window.location.href = "/"} className="border-2 border-ink/20 bg-transparent text-ink hover:bg-ink/5">
            홈으로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}