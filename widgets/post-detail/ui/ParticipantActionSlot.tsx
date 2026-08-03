'use client';

import { ApplyParticipantButton } from "@/features/participant/apply";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";

type Props = {
  status: string;
  studyId: number;
};
  // 상태별 액션 버튼 렌더링
export function ParticipantActionSlot({ status, studyId }: Props) {

    switch (status) {
      case "모집중":
        return (
          <ApplyParticipantButton studyId={studyId} />
        );
      case "수락 대기중":
        return (
          <Button
            disabled
            className="w-full py-6 text-lg bg-warning hover:bg-warning/90"
          >
            수락 대기중
          </Button>
        );
      case "참여중":
        return (
          <div className="flex gap-3">
            <Badge className="flex-1  text-center bg-success text-white text-base justify-center">
              참여중
            </Badge>
            {/* <Button variant="outline" className="flex-1 bg-transparent">
              채팅방 입장
            </Button> */}
          </div>
        );
      case "스터디 종료":
        return (
          <Button disabled className="w-full py-6 text-lg bg-muted">
            모집 마감
          </Button>
        );
      default:
        return null;
    }
  };