import { findStudyById, StudyRepositoryError } from "@/entities/study/api/StudyRepository";
import { StudyId, StudyIdError } from "@/entities/study/model/StudyId";
import { StudyStatus } from "@/entities/study/model/StudyStatus";
import { ok, type Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";

export type StudyEditView = {
  id: number;
  creatorId: string;
  title: string;
  description: string;
  region: string;
  studyCategory: string;
  currentParticipants: number;
  maxParticipants: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type StudyEditViewError =
  | StudyRepositoryError
  | StudyIdError

/** 스터디 수정 폼용 Read (Study 단건 VO → plain, 조인 없음). */
export async function queryStudyEditView(
  supabase: SupabaseClient,
  id: number
): Promise<Result<StudyEditView, StudyEditViewError>> {

  const studyIdVO = StudyId.of(id);
    if (!studyIdVO.ok) return studyIdVO;          // 통과

  const loadedStudyVO = await findStudyById(supabase, studyIdVO.value);
  if (!loadedStudyVO.ok) return loadedStudyVO;              // 통과

  const study = loadedStudyVO.value;

  return ok({
    id: study.id,
    creatorId: study.creatorId,
    title: study.title,
    description: study.description,
    region: study.region,
    studyCategory: study.studyCategory,
    currentParticipants: study.capacity.current,
    maxParticipants: study.capacity.max,
    status: StudyStatus.toString(study.status),
    createdAt: study.createdAt.toISOString(),
    updatedAt: study.updatedAt.toISOString(),
  });
}
