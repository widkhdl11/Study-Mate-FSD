export const STUDY_STATUS = {
  RECRUITING: { label: "모집중", value: "recruiting", color: "bg-success" },
  COMPLETED: { label: "모집완료", value: "completed", color: "bg-muted-foreground" },
  CLOSED: { label: "마감", value: "closed", color: "bg-destructive" },
} as const;

export type StudyStatus = keyof typeof STUDY_STATUS;

