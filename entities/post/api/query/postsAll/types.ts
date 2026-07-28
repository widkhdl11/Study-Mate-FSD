import { PostRow } from "@/entities/post/model/Post";
import { PostResponse } from "@/entities/post/model/types";
import { StudyRow } from "@/entities/study/model/Study";
import { StudyResponse } from "@/entities/study";
import { ProfileRow } from "@/entities/user/model/Profile";
import { ProfileResponse } from "@/entities/user";

// ── 조회 Row (snake, DB/조인 스냅샷) ──
export type PostWithStudyAndCreatorRow = Pick<ProfileRow, "id" | "username" | "email" | "avatar_url">;
export type PostWithStudyRow = PostRow & {
    study: StudyRow
    author: PostWithStudyAndCreatorRow
}

// ── 읽기 투영 View (camel, 화면용) ──
export type PostWithStudyAndCreatorView = Pick<ProfileResponse, "id" | "username" | "email" | "avatarUrl">;
export type PostWithStudyView = PostResponse & {
    study: StudyResponse,
    author: PostWithStudyAndCreatorView
}
