export const STUDY_STATUS = {
  RECRUITING: { label: "모집중", value: "recruiting", color: "bg-green-500" },
  COMPLETED: { label: "모집완료", value: "completed", color: "bg-gray-500" },
  CLOSED: { label: "마감", value: "closed", color: "bg-red-500" },
} as const;

export type StudyStatus = keyof typeof STUDY_STATUS;

