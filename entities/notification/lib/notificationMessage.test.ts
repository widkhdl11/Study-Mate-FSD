import { describe, expect, it } from "vitest";
import { notificationMessage } from "./notificationMessage";

const ctx = { senderName: "홍길동", targetTitle: "알고리즘 스터디" };

describe("notificationMessage", () => {
  it("참가 요청 알림은 신청자 이름과 스터디명을 담는다", () => {
    const { title, content } = notificationMessage("participant_request", ctx);
    expect(title).toBe("새로운 참가요청");
    expect(content).toContain("홍길동");
    expect(content).toContain("알고리즘 스터디");
    expect(content).toContain("참가 요청");
  });

  // 회귀 방지: 참가 "요청"이 실수로 "승인" 메시지로 나가던 버그(applyParticipantAction) 재발 감지.
  it("참가 요청과 참가 승인은 서로 다른 메시지다", () => {
    const req = notificationMessage("participant_request", ctx);
    const acc = notificationMessage("request_accepted", ctx);
    expect(req.content).not.toBe(acc.content);
    expect(acc.content).toContain("승인");
    expect(req.content).not.toContain("승인");
  });

  it("각 타입이 올바른 제목을 반환한다", () => {
    expect(notificationMessage("request_accepted", ctx).title).toBe("참가 승인");
    expect(notificationMessage("request_rejected", ctx).title).toBe("참가 거절");
    expect(notificationMessage("new_participant", ctx).title).toBe("새 참여자");
    expect(notificationMessage("participant_left", ctx).title).toBe("참여자 탈퇴");
    expect(notificationMessage("participant_kicked", ctx).title).toBe("강퇴");
  });

  it("거절 메시지는 스터디명을 담고 '거절'을 포함한다", () => {
    const { content } = notificationMessage("request_rejected", ctx);
    expect(content).toContain("알고리즘 스터디");
    expect(content).toContain("거절");
  });
});
