/**
 * entities/user — Public API
 * 내부(노출 X): ProfileRow
 */

// ── 도메인 VO + 타입 ──
export { UserId } from "./model/UserId"; // value+type (VO with .of)
export type { UserIdError } from "./model/UserId";
export type { Profile, ProfileError } from "./model/Profile"; // 프로필 속성(profiles 테이블) — anemic

// ── 공개 타입 ──
export type { ProfileResponse, MyProfileCountResponse } from "./model/types";

// ── 폼 스키마 (auth / profile) ──
export { loginSchema, signupSchema, passwordChangeSchema } from "./model/authFormSchema";
export type {
  LoginCommand,
  SignupCommand,
  ChangePasswordCommand,
} from "./model/authFormSchema";
export { default as profileEditSchema } from "./model/profileFormSchema";
export type { UpdateProfileCommand } from "./model/profileFormSchema";
