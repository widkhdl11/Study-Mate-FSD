/**
 * entities/user — Public API
 * 내부(노출 X): ProfileRow
 */

// ── 도메인 VO + 타입 ──
export type { Profile, ProfileError } from "./model/Profile"; // 프로필 속성(profiles 테이블) — anemic
export { UserId } from "./model/UserId"; // value+type (VO with .of)
export type { UserIdError } from "./model/UserId";

// ── 읽기 (Query / 현재 유저) ──
export { queryMyProfile } from "./api/query/myProfile/queryMyProfile";
export { queryCurrentUser } from "./api/query/currentUser/queryCurrentUser";
export { useCurrentUser } from "./api/query/currentUser/useCurrentUser";
export type { CurrentUserResponse } from "./api/query/currentUser/types";

// ── 공개 타입 ──
export type { ProfileRow } from "./model/Profile";
export type { MyProfileCountResponse, ProfileResponse } from "./model/types";
// ── 폼 스키마 (auth / profile) ──
export { loginSchema, passwordChangeSchema, signupSchema } from "./model/authFormSchema";
export type {
  ChangePasswordCommand, LoginCommand,
  SignupCommand
} from "./model/authFormSchema";
export { default as profileEditSchema } from "./model/profileFormSchema";
export type { UpdateProfileCommand } from "./model/profileFormSchema";

