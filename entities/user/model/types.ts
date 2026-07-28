import type { ProfileRow } from "./Profile"

export type ProfileResponse = {
    id: string   
    email: string
    username: string
    avatarUrl: string | null
    birthDate: string
    gender: string
    bio: string
    points: number
    createdAt: string
    updatedAt: string
}

// 작성자/생성자 등 "사용자 요약" 읽기 투영 (id/username/email/avatarUrl).
export type UserSummaryView = Pick<ProfileResponse, "id" | "username" | "email" | "avatarUrl">
export type UserSummaryRow = Pick<ProfileRow, "id" | "username" | "email" | "avatar_url">
export function toUserSummaryView(row: UserSummaryRow): UserSummaryView {
    return {
        id: row.id,
        username: row.username,
        email: row.email,
        avatarUrl: row.avatar_url,
    }
}


export interface MyProfileCountResponse {
    myPostsCount: number
    myParticipatedStudiesCount: number
    myParticipatedChatRoomsCount: number
}