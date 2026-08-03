export const STUDY_STATUS = {
  PENDING: { label: "대기중", value: "pending", color: "bg-success" },
  ACCEPTED: { label: "수락", value: "accepted", color: "bg-muted-foreground" },
  REJECTED: { label: "거절", value: "rejected", color: "bg-destructive" },
} as const;

export type StudyStatus = keyof typeof STUDY_STATUS;
