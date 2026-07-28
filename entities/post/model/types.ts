import { ImageUrl } from "@/shared/lib/file"
import type { PostRow } from "./Post"


/**
 * Post 응답 타입
 * 
 */

export type PostWithRelationResponse = {
    id: number
    title: string
    content: string
    imageUrl: ImageUrl[]
    likesCount: number
    viewsCount: number
    commentsCount: number
    createdAt: string   
    updatedAt: string


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
}

export type PostResponse = {
    id: number
    studyId: number
    authorId: string
    title: string
    content: string
    likesCount: number
    commentsCount: number
    viewsCount: number
    createdAt: string
    updatedAt: string
    imageUrl: ImageUrl[]
}

// PostRow(snake) → PostResponse(camel) canonical 매퍼.
export function toPostView(row: PostRow): PostResponse {
    return {
        id: row.id,
        studyId: row.study_id,
        authorId: row.author_id,
        title: row.title,
        content: row.content,
        likesCount: row.likes_count,
        commentsCount: row.comments_count,
        viewsCount: row.views_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        imageUrl: row.image_url,
    }
}

/**
 * 모집글 카드가 실제로 렌더하는 최소 모양 (PostListItem prop).
 * PostResponse 캐논에서 파생 — 이 필드를 가진 어떤 view든 카드에 주입 가능.
 */
export type PostCardView = Pick<
    PostResponse,
    "id" | "title" | "content" | "imageUrl" | "createdAt" | "likesCount" | "viewsCount"
>

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
        size: number
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

export type PostRecommendedResponse = {
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