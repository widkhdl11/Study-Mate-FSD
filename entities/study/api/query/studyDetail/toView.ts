import type { ParticipantResponse } from "@/entities/participant/model/types";
import { toUserSummaryView } from "@/entities/user/model/types";
import type { StudyDetailParticipantRow, StudyDetailQueryRow } from "./row";
import type { StudyDetailView } from "./view";

/**
 * studyDetail 조회 결과 매핑: row(snake, DB 거울) → view(camel, 화면용).
 * 읽기 경계의 유일한 snake→camel 변환 지점. (쓰기측 Study.fromRow의 읽기 버전)
 * row·select·StudyDetailView가 같은 필드여야 함 (ARCHITECTURE §5-c 불변식).
 */
export function toStudyDetailView(row: StudyDetailQueryRow): StudyDetailView {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    studyCategory: row.study_category,
    region: row.region,
    maxParticipants: row.max_participants,
    currentParticipants: row.current_participants,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    participants: row.participants.map(toParticipantResponse),
    posts: row.posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      imageUrl: p.image_url,
      likesCount: p.likes_count,
      viewsCount: p.views_count,
      createdAt: p.created_at,
    })),
    creator: toUserSummaryView(row.creator),
  };
}

function toParticipantResponse(p: StudyDetailParticipantRow): ParticipantResponse {
  return {
    id: p.id,
    userId: p.user_id,
    studyId: p.study_id,
    userEmail: p.user_email,
    status: p.status,
    role: p.role,
    username: p.username,
    avatarUrl: p.avatar_url,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    // createdAt/updatedAt: 상세 쿼리가 participant timestamp를 안 가져옴 (optional이라 생략)
  };
}
