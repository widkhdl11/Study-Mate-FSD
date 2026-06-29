// import * as z from "zod";

// export const studySchema = z.object({
//   id: z.coerce.number<number>().min(1, "스터디를 선택해주세요"),
//   title: z
//     .string()
//     .min(3, "제목은 3자 이상이어야 합니다")
//     .max(50, "제목은 50자 이하여야 합니다"),
//   mainCategory: z.string().min(1, "카테고리를 선택해주세요"),
//   subCategory: z.string().min(1, "카테고리를 선택해주세요"),
//   detailCategory: z.string().min(1, "카테고리를 선택해주세요"),
//   studyCategory: z.coerce.number<number>().min(1, "카테고리를 선택해주세요"),
//   mainRegion: z.string().min(1, "지역을 선택해주세요"),
//   detailRegion: z.string().min(1, "지역을 선택해주세요"),
//   region: z.coerce.number<number>().min(1, "지역을 선택해주세요"),
//   // region: z.coerce.number<number>().min(1, "지역을 선택해주세요"),
//   // region: z.string().min(1, "지역을 선택해주세요"),
//   maxParticipants: z.coerce
//     .number<number>()
//     .min(1, "최소 1명 이상이어야 합니다")
//     .max(20, "최대 20명까지 가능합니다")
//     .int("최대 인원은 정수여야 합니다"),

//   description: z
//     .string()
//     .trim() // 공백 제거
//     .min(1, "설명을 입력해주세요"),
// });
// export type StudyFormValues = z.infer<typeof studySchema>;


import * as z from "zod";

// 공통 스키마 (id 없음)
const studyBaseSchema = z.object({
  title: z
    .string()
    .min(3, "제목은 3자 이상이어야 합니다")
    .max(50, "제목은 50자 이하여야 합니다"),
  mainCategory: z.string().min(1, "카테고리를 선택해주세요"),
  subCategory: z.string().min(1, "카테고리를 선택해주세요"),
  detailCategory: z.string().min(1, "카테고리를 선택해주세요"),
  studyCategory: z.string().min(1, "카테고리를 선택해주세요"),
  // studyCategory: z.coerce.number<number>().min(1, "카테고리를 선택해주세요"),
  mainRegion: z.string().min(1, "지역을 선택해주세요"),
  detailRegion: z.string().min(1, "지역을 선택해주세요"),
  region: z.string().min(1, "지역을 선택해주세요"),
  // region: z.coerce.number<number>().min(0, "지역을 선택해주세요"),
  // currentParticipants: 그냥 값을 읽기 위한 필드(max는 maxParticipants의 값을 사용)
  maxParticipants: z.coerce.number<number>().min(2, "최소 2명 이상이어야 합니다").max(20, "최대 20명까지 가능합니다").int("최대 인원은 정수여야 합니다"),
  description: z
    .string()
    .trim()
    .min(1, "설명을 입력해주세요"),
});

// 생성용 (id 없음)
export const studyCreateSchema = studyBaseSchema;

// 수정용 (id 필수)
export const studyUpdateSchema = studyBaseSchema.extend({
  id: z.coerce.number<number>(),
  updatedAt: z.string(),
});

// 타입
export type CreateStudyCommand = z.infer<typeof studyCreateSchema>;
export type UpdateStudyCommand = z.infer<typeof studyUpdateSchema>;
