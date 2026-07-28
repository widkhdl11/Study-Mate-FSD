import { PostRow } from "@/entities/post/model/Post";
import { PostResponse } from "@/entities/post/model/types";
import { StudyResponse } from "@/entities/study";
import { StudyRow } from "@/entities/study/model/Study";

// ── 조회 Row (snake) ──
export type MyPostWithStudyRow = PostRow & {
    study: StudyRow
}

// ── 읽기 투영 View (camel) ──
export type MyPostWithStudyView = PostResponse & {
    study: StudyResponse
}
