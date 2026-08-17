import { getProfileImageUrl } from "@/shared/api/supabase/storage";
import { getRegionPath } from "@/shared/config/region";
import { getCategoryPath } from "@/shared/config/study-category";
import { studyStatusConversion } from "@/shared/lib/conversion/study";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";
import { Card } from "@/shared/shadcn/ui/card";
import { MapPin, Sparkles } from "lucide-react";
import type { PostRecommendedView } from "../model/types";

// 플래너 월드 AI 추천 콤팩트 카드. 순위 = 잉크 마커 태그, 카테고리·지역 = 얇은 메타,
// 호스트 + 좌석(참여) = 한 푸터. 이미지 없이 정보 밀도.
export function RecommendedStudyCard({
    post,
    rank,
}: {
    post: PostRecommendedView;
    rank: number;
}) {
    const categoryLabels = getCategoryPath(Number(post.study.studyCategory)).labels;
    const region = getRegionPath(Number(post.study.region)).labels.join(" ");
    const max = post.study.maxParticipants;
    const cur = post.study.currentParticipants;
    const pct = max > 0 ? Math.min(100, (cur / max) * 100) : 0;
    const recruiting = post.study.status === "recruiting";

    return (
        <Card className="group flex h-full flex-col gap-3.5 rounded-xl border-2 border-ink/15 bg-paper p-5 text-ink shadow-soft transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-ink/40 hover:shadow-lift">
            {/* 순위 마커 + 상태 */}
            <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-xs font-bold text-paper">
                    <Sparkles className="h-3 w-3" />
                    AI 추천 {rank}위
                </span>
                <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                        recruiting ? "bg-hl-mint text-ink" : "bg-ink/10 text-ink-soft"
                    }`}>
                    {studyStatusConversion(post.study.status)}
                </span>
            </div>

            {/* 제목 + 설명 */}
            <div className="flex-1">
                <h3 className="line-clamp-1 font-bold text-ink">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                    {post.content}
                </p>
            </div>

            {/* 카테고리 · 지역 — 얇은 메타 한 줄 */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-ink-soft">
                <span className="font-semibold text-ink/80">{categoryLabels.join(" · ")}</span>
                <span aria-hidden className="text-ink/25">·</span>
                <span className="inline-flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {region}
                </span>
            </div>

            {/* 푸터: 호스트 + 좌석(참여) */}
            <div className="flex items-center justify-between gap-2 border-t-2 border-dashed border-paper-line pt-3">
                <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage
                            src={getProfileImageUrl(post.author.avatarUrl)}
                            alt={post.author.username}
                        />
                        <AvatarFallback className="bg-ink text-xs text-paper">
                            {post.author.username[0] || ""}
                        </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium text-ink">
                        {post.author.username}
                    </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <div className="h-1.5 w-14 overflow-hidden rounded-full bg-ink/10">
                        <div className="h-full rounded-full bg-hl-coral" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold tabular-nums text-ink">{cur}/{max}석</span>
                </div>
            </div>
        </Card>
    );
}
