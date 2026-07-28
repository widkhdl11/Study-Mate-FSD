import type { ProfileRow } from "@/entities/user/model/Profile"
import type { ProfileResponse } from "@/entities/user/model/types"

// 로그인 검증 / 현재 유저 요약 읽기 투영 (id/username/email/avatarUrl)
export type CurrentUserResponse = Pick<ProfileResponse, "id" | "username" | "email" | "avatarUrl">
export type CurrentUserRow = Pick<ProfileRow, "id" | "username" | "email" | "avatar_url">
