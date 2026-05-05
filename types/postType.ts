export type PostsResponse = {
    // posts 테이블 컬럼만
    id: number
    title: string
    content: string
    author_id: string
    likes_count: number
    views_count: number
    created_at: string
    image_url: {
        id: string
        url: string
        originalName: string
        siae: number
    }[]

    // JOIN된 데이터
    study: {
        id: number
        title: string
        description: string
        study_category: number
        region: number
        max_participants: number
        current_participants: number
        status: string
        created_at: string
        creator: {
            id: number
            username: string
            email: string
            avatar_url: string
        }
    }

    author: {
        id: number
        email: string
        username: string
        avatar_url: string | null
    }
}[]

export type PostDetailResponse = {
    id: number
    title: string
    content: string
    author_id: string
    likes_count: number
    views_count: number
    created_at: string
    image_url: {
        id: string
        url: string
        originalName: string
        siae: number
    }[]
    study: {
        id: number
        title: string
        description: string
        study_category: number
        region: number
        max_participants: number
        current_participants: number
        status: string
        created_at: string
    }
    author: {
        id: number
        email: string
        username: string
        avatar_url: string | null
    }
}

export type PostsRecommendedResponse = {
    id: number
    title: string
    content: string
    study_id: number
    image_url: string
    study: {
        id: number
        title: string
        description: string
        study_category: number
        region: number
        max_participants: number
        current_participants: number
        status: string
        created_at: string
    }
    author: {
        id: number
        username: string
        avatar_url: string
    }
}