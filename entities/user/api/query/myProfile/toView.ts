import { ProfileRow } from "@/entities/user/model/Profile";
import { ProfileResponse } from "@/entities/user/model/types";

export function toProfileResponse(profile: ProfileRow): ProfileResponse {
    return {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        avatarUrl: profile.avatar_url,
        birthDate: profile.birth_date,
        gender: profile.gender,
        bio: profile.bio,
        points: profile.points,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
    }
}