'use client';


export const participantRoleConversion = (role: string) => {
  switch (role) {
    case "host":
      return "호스트";
    case "common":
      return "멤버";
  }
};

export const participantStatusConversion = (status: string) => {
  switch (status) {
    case "pending":
      return "대기중";
    case "accepted":
      return "참여중";
    case "rejected":
      return "거절";
  }
};

// 글 상세 사이드바에서 "내 참여 상태"를 보여주는 라벨 맵 (CTA성 문구).
// ⚠️ participantStatusConversion과 라벨이 다름(pending=수락 대기중) — 의도된 분기.
// rejected는 "스터디 종료"가 아니라 "신청 거절됨"이어야 함(스터디 마감과 별개 상태).
export const PARTICIPANT_STATUS_MAP: Record<string, string> = {
  accepted: "참여중",
  pending: "수락 대기중",
  rejected: "신청 거절됨",
};