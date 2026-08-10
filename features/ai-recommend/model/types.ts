import { ImageUrl } from "@/shared/lib/file"

/**
 * ai-recommend 피처의 읽기 DTO.
 * Gemini(외부 소스)가 프롬프트 스키마대로 뱉는 raw JSON은 snake — 읽기 경계의 Row.
 * 화면은 camel View만 소비하며, 경계에서 toPostRecommendedView로 매핑한다.
 * (필드는 프롬프트가 실제로 방출하는 것만 — 타입 = 스키마 = 현실)
 */
export type PostRecommendedRow = {
    id: number
    title: string
    content: string
    image_url: ImageUrl[]
    study: {
        id: number
        title: string
        description: string
        study_category: number
        region: number
        max_participants: number
        current_participants: number
        status: string
    }
    author: {
        id: number
        username: string
        avatar_url: string
    }
}

/** 홈 AI 추천 응답 — 개인화 요약 문장 + 추천 목록을 함께 담는다(요약+추천 통합). */
export type AIRecommendationResult = {
    summary: string;
    posts: PostRecommendedView[];
};

export type PostRecommendedView = {
    id: number
    title: string
    content: string
    imageUrl: ImageUrl[]
    study: {
        id: number
        title: string
        description: string
        studyCategory: number
        region: number
        maxParticipants: number
        currentParticipants: number
        status: string
    }
    author: {
        id: number
        username: string
        avatarUrl: string
    }
}

// PostRecommendedRow(snake) → PostRecommendedView(camel) 경계 매퍼
export function toPostRecommendedView(row: PostRecommendedRow): PostRecommendedView {
    return {
        id: row.id,
        title: row.title,
        content: row.content,
        imageUrl: row.image_url,
        study: {
            id: row.study.id,
            title: row.study.title,
            description: row.study.description,
            studyCategory: row.study.study_category,
            region: row.study.region,
            maxParticipants: row.study.max_participants,
            currentParticipants: row.study.current_participants,
            status: row.study.status,
        },
        author: {
            id: row.author.id,
            username: row.author.username,
            avatarUrl: row.author.avatar_url,
        },
    }
}
