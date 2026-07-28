import type { ParticipantResponse } from "@/entities/participant/model/types";
import type { PostCardView } from "@/entities/post";
import type { ProfileResponse } from "@/entities/user/model/types";
import { ImageUrl } from "@/shared/lib/file";

/**
 * studyDetail 조회용 raw row (Read Query).
 * VO가 아닌 DB/조인 스냅샷 — 화면 Read Model의 입력.
 */
export type StudyDetailCreatorRow = {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
};

export type StudyDetailParticipantRow = {
  id: number;
  user_id: string;
  username: string;
  user_email: string;
  study_id: number;
  role: string;
  status: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

export type StudyDetailPostRow = {
  id: number;
  title: string;
  content: string;
  image_url: ImageUrl[];
  likes_count: number;
  views_count: number;
  created_at: string;
};

export type StudyDetailQueryRow = {
  id: number;
  creator_id: string;
  title: string;
  description: string;
  region: string;
  study_category: string;
  max_participants: number;
  current_participants: number;
  status: string;
  created_at: string;
  updated_at: string;
  creator: StudyDetailCreatorRow;
  participants: StudyDetailParticipantRow[];
  posts: StudyDetailPostRow[];
};

/**
 * study 상세 화면이 실제로 쓰는 읽기 모델 (Read DTO).
 * 불변식: 이 view = StudyDetailQueryRow = queryStudyDetail의 select.
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
