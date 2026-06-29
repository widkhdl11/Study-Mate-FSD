import { PostsWithStudyRow } from "./row";
import { PostsWithStudyView } from "./view";

export function toPostsWithStudyView(rows: PostsWithStudyRow): PostsWithStudyView {
    return rows.map(row => ({
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
        study: {
            id: row.study.id,
            creatorId: row.study.creator_id,
            title: row.study.title,
            description: row.study.description,
            studyCategory: row.study.study_category,
            region: row.study.region,
            maxParticipants: row.study.max_participants,
            currentParticipants: row.study.current_participants,
            status: row.study.status,
            createdAt: row.study.created_at,
            updatedAt: row.study.updated_at,
        },
    }))
}