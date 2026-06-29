import z from "zod";

const profileEditSchema = z.object({
    username: z.string().min(2, "이름은 2자 이상이어야 합니다").max(20, "이름은 20자 이하여야 합니다"),
    email: z.string().email("유효한 이메일을 입력해주세요").optional(),
    bio: z.string().max(200, "소개는 200자 이하여야 합니다").optional(),
    birthDate: z.string().min(1, "생년월일을 선택해주세요"),
    gender: z.string().min(1, "성별을 선택해주세요"),
  })
  
  export type UpdateProfileCommand = z.infer<typeof profileEditSchema>
  export default profileEditSchema;