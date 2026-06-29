export const STUDY_STATUS = {
  PENDING: { label: "대기중", value: "pending", color: "bg-green-500" },
  ACCEPTED: { label: "수락", value: "accepted", color: "bg-gray-500" },
  REJECTED: { label: "거절", value: "rejected", color: "bg-red-500" },
} as const;

export type StudyStatus = keyof typeof STUDY_STATUS;
