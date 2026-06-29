import type { StudyEditView } from "@/entities/study";

// 스터디 수정 폼의 값 타입 
export type StudyEditFormValues = StudyEditView & {
  mainCategory: string;
  subCategory: string;
  detailCategory: string;
  mainRegion: string;
  detailRegion: string;
};
