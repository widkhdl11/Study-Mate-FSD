/**
 * studyDetail 조회용 raw row (Read Query).
 * VO가 아닌 DB/조인 스냅샷 — 화면 Read Model의 입력.
 */

import { ImageUrl } from "@/shared/lib/file";

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
