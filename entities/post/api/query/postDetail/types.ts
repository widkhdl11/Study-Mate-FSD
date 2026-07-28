import { PostRow } from "@/entities/post/model/Post";
import { PostResponse } from "@/entities/post/model/types";
import { StudyDetailCreatorView } from "@/entities/study/api/query/studyDetail/types";
import { StudyRow } from "@/entities/study/model/Study";
import { StudyResponse } from "@/entities/study/model/types";
import { ProfileRow } from "@/entities/user/model/Profile";
import { ProfileResponse } from "@/entities/user/model/types";

// ── 조회 Row (snake) ──
export type PostDetailStudyRow = Pick<StudyRow,
 "id"
 | "title"
 | "description"
 | "study_category"
 | "region"
 | "status"
 | "max_participants"
 | "current_participants"
 | "created_at">

export type PostDetailCreatorRow = Pick<ProfileRow,
"id"
| "username"
| "email"
| "avatar_url">

// PostRow와 PostDetailStudyRow, PostDetailCreatorRow를 조인한 타입
export type PostDetailQueryRow = PostRow & {
    study: PostDetailStudyRow;
    author: PostDetailCreatorRow;
}

// ── 읽기 투영 View (camel) ──
export type PostDetailStudyView = Pick<StudyResponse,
"id" | "title" | "description" | "studyCategory" | "region" | "maxParticipants" | "currentParticipants" | "status" | "createdAt">;

export type PostDetailCreatorView = Pick<ProfileResponse,
"id" | "username" | "email" | "avatarUrl">;

export type PostDetailView =
PostResponse &
{
    study: PostDetailStudyView,
    author: StudyDetailCreatorView,
}
