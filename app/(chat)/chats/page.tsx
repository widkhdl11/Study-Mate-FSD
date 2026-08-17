import { EmptyState } from "@/shared/ui/EmptyState";
import { MessageCircle } from "lucide-react";

/**
 * 채팅 인덱스 — 방 미선택 상태.
 * 데스크톱: 우측에 안내 플레이스홀더. 모바일: 숨겨서 좌측 목록이 전체화면을 차지하게 한다.
 */
export default function ChatsIndexPage() {
  return (
    <div className="hidden h-full items-center justify-center bg-ink/5 p-6 md:flex">
      <EmptyState
        icon={MessageCircle}
        title="대화를 선택하세요"
        description="왼쪽 목록에서 채팅방을 선택하면 대화가 여기에 표시됩니다."
      />
    </div>
  );
}
