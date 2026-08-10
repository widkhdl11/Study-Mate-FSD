import type { StudyRow } from "./Study"

export type StudyResponse = {
    id: number
    creatorId: string
    title: string
    description: string
    studyCategory: string
    region: string
    maxParticipants: number
    currentParticipants: number
    status: string
    createdAt: string
    updatedAt: string
}

// StudyRow(snake) → StudyResponse(camel) canonical 매퍼.
// 여러 read가 study를 조인할 때 이걸 조합 (매핑 중복 제거 + study가 자기 매핑을 소유).
export function toStudyView(row: StudyRow): StudyResponse {
    return {
        id: row.id,
        creatorId: row.creator_id,
        title: row.title,
        description: row.description,
        studyCategory: row.study_category,
        region: row.region,
        maxParticipants: row.max_participants,
        currentParticipants: row.current_participants,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}