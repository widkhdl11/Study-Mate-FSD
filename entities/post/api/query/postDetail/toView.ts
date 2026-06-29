import { toPostView } from "@/entities/post/model/types";
import { toUserSummaryView } from "@/entities/user/model/types";
import { PostDetailQueryRow } from "./row";
import { PostDetailView } from "./view";

export function toPostDetailView(row: PostDetailQueryRow): PostDetailView {
    return {
        ...toPostView(row),
        // study는 상세 전용 subset(creator_id/updated_at 미선택)이라 인라인 유지
        study: {
            id: row.study.id,
            title: row.study.title,
            description: row.study.description,
            studyCategory: row.study.study_category,
            region: row.study.region,
            maxParticipants: row.study.max_participants,
            currentParticipants: row.study.current_participants,
            status: row.study.status,
            createdAt: row.study.created_at,
        },
        author: toUserSummaryView(row.author),
    }
}
