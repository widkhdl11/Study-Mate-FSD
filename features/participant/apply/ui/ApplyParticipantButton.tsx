'use client';

import { Button } from "@/shared/shadcn/ui/button";
import { useApplyParticipant } from "../model/useApplyParticipant";

  // 상태별 액션 버튼 렌더링 (label로 신규 신청/재신청 문구 구분)
export function ApplyParticipantButton({ studyId, label = "참여 신청" }: { studyId: number; label?: string }) {

    const { mutate: applyMutation, isPending: isApplying } = useApplyParticipant(studyId);
    return (
        <Button
            className="w-full py-6 text-lg bg-ink text-paper hover:bg-ink/90 active:scale-[0.97]"
            onClick={() => applyMutation()}
            disabled={isApplying}
        >
            {isApplying ? "신청 중..." : label}
        </Button>
    )
  };