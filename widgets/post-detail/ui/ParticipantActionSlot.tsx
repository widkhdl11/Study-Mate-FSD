'use client';

import { ParticipantResponse } from "@/entities/participant";
import { ApplyParticipantButton } from "@/features/participant/apply";
import { WithdrawButton } from "@/features/participant/withdraw";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import Link from "next/link";

// 모집 상태 축 (스터디 속성): 여유 / 정원참 / 종료
type Recruitment = "open" | "full" | "closed";

type Props = {
  // 개인 참여 상태 (raw): pending | accepted | rejected | kicked, 미신청이면 null
  myStatus: string | null;
  recruitment: Recruitment;
  studyId: number;
  participant: ParticipantResponse | null; // 신청 취소에 필요한 participant.id 원본
  isOwner?: boolean;
  chatRoomId?: number | null;
};

// 두 축(개인 참여 상태 × 모집 상태)을 분리해 "내 다음 행동"만 렌더링한다.
// 모집 상태 배지는 SidebarSection이 담당 — 여기서 중복 표기하지 않는다.
export function ParticipantActionSlot({
  myStatus,
  recruitment,
  studyId,
  participant,
  isOwner = false,
  chatRoomId = null,
}: Props) {

  // 소유자(호스트)는 자기 스터디에 신청할 수 없다 — 신청 대신 신청자 관리로.
  if (isOwner) {
    return (
      <Button asChild className="w-full py-6 text-lg">
        <Link href={`/studies/${studyId}`}>신청자 관리</Link>
      </Button>
    );
  }

  // ── 개인 참여 상태가 우선한다 ──
  switch (myStatus) {
    case "accepted":
      return (
        <div className="flex gap-3">
          <Badge className="flex-1 text-center bg-success text-white text-base justify-center">
            참여중
          </Badge>
          {chatRoomId != null && (
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/chats/${chatRoomId}`}>채팅방 입장</Link>
            </Button>
          )}
        </div>
      );

    case "pending":
      return (
        <div className="flex flex-col gap-2">
          <Button disabled className="w-full py-6 text-lg bg-warning hover:bg-warning/90">
            수락 대기중
          </Button>
          {participant && (
            <div className="flex justify-end">
              <WithdrawButton studyId={studyId} participant={participant} />
            </div>
          )}
        </div>
      );

    case "rejected":
      // 거절돼도 재신청 허용 — 단, 아직 모집 여유가 있을 때만.
      if (recruitment === "open") {
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              이전 신청은 거절되었어요. 다시 신청할 수 있습니다.
            </p>
            <ApplyParticipantButton studyId={studyId} label="재신청" />
          </div>
        );
      }
      return (
        <Button disabled className="w-full py-6 text-lg bg-danger hover:bg-danger/90 text-white">
          신청 거절됨
        </Button>
      );

    case "kicked":
      return (
        <Button disabled className="w-full py-6 text-lg">
          참여할 수 없는 스터디입니다
        </Button>
      );
  }

  // ── 미신청(myStatus === null) → 모집 상태로 분기 ──
  switch (recruitment) {
    case "open":
      return <ApplyParticipantButton studyId={studyId} />;
    case "full":
      return (
        <Button disabled className="w-full py-6 text-lg">
          모집 완료 (정원 마감)
        </Button>
      );
    case "closed":
      return (
        <Button disabled className="w-full py-6 text-lg">
          모집 종료
        </Button>
      );
  }
}
