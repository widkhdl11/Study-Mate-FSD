'use client';

import { Button } from "@/shared/shadcn/ui/button";
import { useApplyParticipant } from "../model/useApplyParticipant";

  // 상태별 액션 버튼 렌더링
export function ApplyParticipantButton({studyId }: {studyId: number}) {

    const { mutate: applyMutation, isPending: isApplying } = useApplyParticipant(studyId);
    return (
        <Button
            className="w-full py-6 text-lg bg-primary hover:bg-primary/90"
            onClick={() => applyMutation()}
            disabled={isApplying}
        >
            {isApplying ? "신청 중..." : "참여 신청"}
        </Button>
    )
  };