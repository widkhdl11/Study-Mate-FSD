import { MyChatRoomView } from "../model/types";

/**
 * 채팅방 목록 정렬 비교자 — 최신 메시지 desc, 메시지 없는 방(null)은 마지막, chat.id desc 타이브레이크.
 * queryMyChatRooms(서버)와 **동일 규칙**이라, 클라이언트 낙관적/실시간 재정렬이 서버 순서와 어긋나지 않는다.
 */
export function compareMyChatRooms(a: MyChatRoomView, b: MyChatRoomView): number {
  const at = a.chat.last_message_at;
  const bt = b.chat.last_message_at;
  if (at && bt) {
    if (at !== bt) return at < bt ? 1 : -1; // 최신이 위로(desc)
    return b.chat.id - a.chat.id;
  }
  if (at) return -1; // a만 메시지 있음 → a 먼저
  if (bt) return 1; // b만 메시지 있음 → b 먼저
  return b.chat.id - a.chat.id; // 둘 다 없음 → id desc
}
