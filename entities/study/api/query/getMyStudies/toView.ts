import { StudyRow } from "@/entities/study/model/Study";
import { StudyResponse } from "@/entities/study/model/types";

export function toGetMyStudiesView(studies: StudyRow[]): StudyResponse[] {
    return studies.map(study => ({
        id: study.id,
        creatorId: study.creator_id,
        title: study.title,
        description: study.description,
        studyCategory: study.study_category,
        region: study.region,
        maxParticipants: study.max_participants,
        currentParticipants: study.current_participants,
        status: study.status,
        createdAt: study.created_at,
        updatedAt: study.updated_at,
    }));
}