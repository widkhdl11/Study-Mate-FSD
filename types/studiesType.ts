export type StudiesResponse = {
    id: number
    title: string
    description: string
    study_category: string
    region: string
    max_participants: number
    current_participants: number
    status: string
    created_at: string
    updated_at: string
    participants: {
        id: number
        user_id: string
        username: string
        avatar_url: string
        user_email: string
        study_id: number
        status: string
        role: string
        created_at: string
        updated_at: string
    }[]
    posts: {
        id: number
        title: string
        content: string
        image_url: string
        created_at: string
        updated_at: string
        likes_count: number
        views_count: number
    }[]
    creator: {
        id: string
        username: string
        email: string
        avatar_url: string
    }
}[]

export type StudyResponse = {
    id: number
    title: string
    description: string
    study_category: number
    region: number
    max_participants: number
    current_participants: number
    status: string
    created_at: string
    updated_at: string
    participants: {
        id: number
        user_id: string
        username: string
        avatar_url: string
        user_email: string
        study_id: number
        status: string
        role: string
        created_at: string
        updated_at: string
    }[]
    posts: {
        id: number
        title: string
        content: string
        image_url: string
        created_at: string
        updated_at: string
        likes_count: number
        views_count: number
    }[]
    creator: {
        id: string
        username: string
        email: string
        avatar_url: string
    }
}

export type StudyWithAllCategoriesAndRegions = {
    id: number
    title: string
    description: string
    study_category: number
    max_participants: number
    current_participants: number
    status: string
    created_at: string
    updated_at: string
    mainCategory: string
    subCategory: string
    detailCategory: string
    studyCategory: number
    mainRegion: string
    detailRegion: string
    region: number
    maxParticipants: number
}

export type StudyDetailResponse = {
    id: number
    title: string
    description: string
    study_category: string
    region: string
    max_participants: number
    current_participants: number
    status: string
    created_at: string
    updated_at: string
}

// 상태 결정 함수
export const STATUS_MAP: Record<string, string> = {
    accepted: '참여중',
    pending: '수락 대기중',
    rejected: '스터디 종료',
}

export type StudiesRecommendedResponse = {
    id: number
    name: string
    category: string
    region: string
    description: string
    current_participants: number
    max_participants: number

}