'use client';

import { ApplyParticipantButton } from "@/features/participant/apply";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import Link from "next/link";

type Props = {
  status: string;
  studyId: number;
  isOwner?: boolean;
  chatRoomId?: number | null;
};
  // 상태별 액션 버튼 렌더링
export function ParticipantActionSlot({ status, studyId, isOwner = false, chatRoomId = null }: Props) {

    // 소유자(호스트)는 자기 스터디에 신청할 수 없다 — 신청 대신 신청자 관리로.
    if (isOwner) {
      return (
        <Button asChild className="w-full py-6 text-lg">
          <Link href={`/studies/${studyId}`}>신청자 관리</Link>
        </Button>
      );
    }

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
            {chatRoomId != null && (
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/chats/${chatRoomId}`}>채팅방 입장</Link>
              </Button>
            )}
          </div>
        );
      case "신청 거절됨":
        return (
          <Button disabled className="w-full py-6 text-lg bg-danger hover:bg-danger/90 text-white">
            신청 거절됨
          </Button>
        );
      default:
        return null;
    }
  };