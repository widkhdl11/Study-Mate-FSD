import * as z from "zod";

// 로그인 스키마
export const loginSchema = z.object({
  email: z.email("유효한 이메일을 입력해주세요"),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요")
    .min(6, "비밀번호는 6자 이상이어야 합니다"),
});

// 회원가입 스키마

export const signupSchema = z.object({
  username: z
      .string()
      .min(1, "아이디를 입력해주세요")
      .min(3, "아이디는 3자 이상이어야 합니다")
      .max(20, "아이디는 20자 이하여야 합니다")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "아이디는 영문, 숫자, 언더스코어만 사용 가능합니다"
      ),
    email: z.email("유효한 이메일을 입력해주세요"),
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요")
      .min(6, "비밀번호는 6자 이상이어야 합니다"),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요"),
    birthDate: z.string().min(1, "생년월일을 선택해주세요"),
    gender: z
    .enum(["male", "female"])
    .optional()
    .refine((val) => val !== undefined, {
      message: "성별을 선택해주세요",
    }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["passwordConfirm"],
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, "현재 비밀번호를 입력해주세요"),
  newPassword: z.string().min(6, "새 비밀번호는 6자 이상이어야 합니다"),
  newPasswordConfirm: z.string(),
}).refine((data) => data.newPassword === data.newPasswordConfirm, {
  message: "새 비밀번호가 일치하지 않습니다",
  path: ["newPasswordConfirm"],
})
.refine((data) => data.currentPassword !== data.newPassword, {
    message: "새 비밀번호는 현재 비밀번호와 달라야 합니다",
    path: ["newPassword"],
  })

export type ChangePasswordCommand = z.infer<typeof passwordChangeSchema>;

// 타입 추출
export type LoginCommand = z.infer<typeof loginSchema>;
export type SignupCommand = z.infer<typeof signupSchema>;
// export type SignupServerValues = z.infer<typeof signupServerSchema>;