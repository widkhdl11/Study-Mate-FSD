import type { ParticipantResponse } from "@/entities/participant/model/types";
import type { PostCardView } from "@/entities/post/model/types";
import type { ProfileResponse } from "@/entities/user/model/types";

/**
 * study 상세 화면이 실제로 쓰는 읽기 모델 (Read DTO).
 * 캐논 타입에서 파생 — ARCHITECTURE §5-c "Read DTO 규칙" 참고.
 * 불변식: 이 view = studyDetailQueryRow = queryStudyDetail의 select.
 */

/** 조인된 외부 애그리거트(Profile)는 사적 필드 제외, 표시용 4필드만 */
export type StudyDetailCreatorView = Pick<
  ProfileResponse,
  "id" | "username" | "email" | "avatarUrl"
>;

export type StudyDetailView = {
  id: number;
  title: string;
  description: string;
  studyCategory: string;
  region: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  participants: ParticipantResponse[];
  posts: PostCardView[];
  creator: StudyDetailCreatorView;
};
