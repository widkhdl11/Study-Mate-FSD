// 알림이 "무엇을 가리키는가" — 도메인 참조 VO.
// - 라우트 문자열은 모른다(그건 presentation의 몫: shared/lib/conversion/notification).
// - 느슨한 참조(FK 없음) + 열린 집합(DB CHECK 없음)이라, 모름/불완전은 에러가 아니라 null.
// - 지금은 read(표시) 경계만 넘으므로 parse 하나면 충분. 생성자/직렬화는 write 호출자가 생기면 추가.

export type NotificationReference =
  | { readonly kind: "study"; readonly id: number }

export type NotificationReferenceError = {
  readonly kind: 'InvalidNotificationReference'
  readonly value: string;
}

export const NotificationReference = {
  /**
   * 경계 변환: DB의 자유 (reference_type, reference_id) 쌍 → 타입 있는 참조.
   * 관대(total)하게 처리 — 아는 타입 + id가 있을 때만 참조를 만들고, 나머지는 null.
   */
  parse: (
    type: string,
    id: number,
  ): NotificationReference => {
    switch (type) {
      case "study":
        return { kind: "study", id };
      // case "post": return { kind: "post", id };  ← 확장은 여기 한 줄 + href에 한 줄
      default:
        throw new Error("모르는 reference_type");
    }
  },
};
