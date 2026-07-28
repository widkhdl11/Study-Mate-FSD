export interface ParticipantWithStudyResponse {
  id?: number;
  user_id?: string;
  status?: string;
  study_id?: number;
  role?: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  study: {
    id: number;
    title: string;
  };
}

export interface ParticipantResponse {
  id: number;
  userId?: string;
  studyId: number;
  userEmail: string;
  status: string;
  role: string;
  username: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}