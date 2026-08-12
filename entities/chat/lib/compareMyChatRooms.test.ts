import { describe, expect, it } from "vitest";
import type { MyChatRoomView } from "../model/types";
import { compareMyChatRooms } from "./compareMyChatRooms";

// 최소 MyChatRoomView 픽스처 — 정렬에 쓰이는 chat.id / chat.last_message_at만 의미 있음.
function room(id: number, lastMessageAt: string | null): MyChatRoomView {
  return {
    id,
    chat_id: id,
    user_id: "u",
    created_at: "2026-01-01T00:00:00.000Z",
    last_read_at: null,
    chat: {
      id,
      study_id: null,
      is_group: true,
      name: `방${id}`,
      creator_id: null,
      last_message: null,
      last_message_at: lastMessageAt,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: null,
    },
    profile: { username: "u", avatar_url: null },
    unreadCount: 0,
  };
}

const sortedIds = (rooms: MyChatRoomView[]): number[] =>
  [...rooms].sort(compareMyChatRooms).map((r) => r.chat.id);

describe("compareMyChatRooms", () => {
  it("최신 메시지 방이 위로 온다 (last_message_at 내림차순)", () => {
    const rooms = [
      room(1, "2026-08-12T10:00:00.000Z"),
      room(2, "2026-08-12T12:00:00.000Z"),
      room(3, "2026-08-12T11:00:00.000Z"),
    ];
    expect(sortedIds(rooms)).toEqual([2, 3, 1]);
  });

  it("메시지 없는 방(null)은 맨 아래로 간다", () => {
    const rooms = [
      room(1, null),
      room(2, "2026-08-12T12:00:00.000Z"),
      room(3, null),
    ];
    // 2(메시지 있음) 먼저, 그 뒤 null 방은 id 내림차순 → 3, 1
    expect(sortedIds(rooms)).toEqual([2, 3, 1]);
  });

  it("last_message_at이 동점이면 chat.id 내림차순으로 정렬한다", () => {
    const t = "2026-08-12T12:00:00.000Z";
    expect(sortedIds([room(1, t), room(3, t), room(2, t)])).toEqual([3, 2, 1]);
  });

  it("둘 다 메시지가 없으면 chat.id 내림차순", () => {
    expect(sortedIds([room(1, null), room(2, null), room(3, null)])).toEqual([3, 2, 1]);
  });

  it("혼합: 최신순 + null 마지막 + 동점 id 타이브레이크", () => {
    const rooms = [
      room(5, null),
      room(1, "2026-08-12T09:00:00.000Z"),
      room(4, "2026-08-12T12:00:00.000Z"),
      room(2, "2026-08-12T12:00:00.000Z"), // 4와 동점 → id 큰 4가 먼저
      room(3, null),
    ];
    expect(sortedIds(rooms)).toEqual([4, 2, 1, 5, 3]);
  });

  it("정렬은 서버 규칙과 일치해야 하므로 결정론적이다 (같은 입력 → 같은 순서)", () => {
    const build = () => [
      room(2, "2026-08-12T12:00:00.000Z"),
      room(1, "2026-08-12T12:00:00.000Z"),
      room(3, null),
    ];
    expect(sortedIds(build())).toEqual(sortedIds(build()));
  });
});
