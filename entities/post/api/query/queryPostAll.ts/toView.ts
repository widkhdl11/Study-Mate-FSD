import { toPostView } from "@/entities/post/model/types"
import { toStudyView } from "@/entities/study/model/types"
import { toUserSummaryView } from "@/entities/user/model/types"
import { PostAllQueryRow } from "./row"
import { PostAllViews } from "./view"

// 각 엔티티의 canonical 매퍼를 조합 (post + study + creator).
// 필드 매핑은 각 엔티티가 소유 → 여기선 "조립"만 한다.
export function toPostAllView(rows: PostAllQueryRow): PostAllViews {
    return rows.map((row) => ({
        ...toPostView(row),
        study: {
            ...toStudyView(row.study),
            creator: toUserSummaryView(row.study.creator),
        },
    }))
}
