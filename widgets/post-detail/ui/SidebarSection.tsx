'use client'

import { useParticipantStatus, ParticipantResponse } from "@/entities/participant"
import { usePostDetail, PostDetailView } from "@/entities/post"
import { getProfileImageUrl } from "@/shared/api/supabase/storage"
import { getRegionPath } from "@/shared/config/region"
import { getCategoryPath } from "@/shared/config/study-category"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Card } from "@/shared/shadcn/ui/card"
import { ParticipantActionSlot } from "./ParticipantActionSlot"

export default function SidebarSection({ postData, participant, isOwner = false, chatRoomId = null }: {
  postData: PostDetailView, participant: ParticipantResponse | null, isOwner?: boolean, chatRoomId?: number | null
}) {

    const { data: post } = usePostDetail(postData)

    const {data : participantData} = useParticipantStatus(participant, post.study.id);

    // 개인 참여 상태 (raw): pending | accepted | rejected | kicked, 미신청이면 null
    const myStatus = participantData?.status ?? null;

    // 모집 상태 축 — completed 전이(정원참)가 없으므로 정원까지 같이 본다.
    const isFull = (post.study.currentParticipants ?? 0) >= post.study.maxParticipants;
    const recruitment: "open" | "full" | "closed" =
      post.study.status !== "recruiting" ? "closed"
      : isFull                            ? "full"
      :                                     "open";

    const recruitmentLabel =
      recruitment === "open" ? "모집중" : recruitment === "full" ? "모집 완료" : "모집 종료";

    return (
         <div className="lg:col-span-1">
              {/* 스터디 정보 카드 */}
              <Card className="p-6 sticky top-20 bg-paper border-2 border-ink/15 rounded-xl shadow-soft">
                {/* 모집 상태 배지 (스터디 속성 — 개인 참여 상태는 액션 버튼이 표시) */}
                <div className="mb-4">
                  <Badge
                    className={`rounded-md font-bold ${
                      recruitment === "open"
                        ? "bg-hl-mint text-ink"
                        : recruitment === "full"
                        ? "bg-hl-coral text-ink"
                        : "bg-ink/10 text-ink-soft"
                    }`}
                  >
                    {recruitmentLabel}
                  </Badge>
                </div>

                {/* 스터디 제목 */}
                <h2 className="text-xl font-bold text-ink mb-4">
                  {post.study.title}
                </h2>

                {/* 카테고리 & 위치 배지 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {getCategoryPath(Number(post.study.studyCategory)).labels.map((category) => (
                    <Badge key={category} className="rounded-md bg-ink/5 text-ink border-0 text-xs font-normal">{category}</Badge>
                  ))}
                    <Badge variant="outline"  className="rounded-md border border-ink/20 text-ink-soft text-xs font-normal">{getRegionPath(Number(post.study.region)).labels.join(" ")}</Badge>
                </div>

                {/* 참여 인원 진행률 */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-ink">
                      참여 인원
                    </span>
                    <span className="text-sm font-bold text-ink tabular-nums">
                      {post.study.currentParticipants || 0}/
                      {post.study.maxParticipants}
                    </span>
                  </div>
                  <div
                    className="w-full bg-ink/10 rounded-full h-2 overflow-hidden"
                    role="progressbar"
                    aria-label="참여 인원"
                    aria-valuemin={0}
                    aria-valuemax={post.study.maxParticipants}
                    aria-valuenow={post.study.currentParticipants || 0}
                  >
                    <div
                      className="bg-hl-coral h-2 rounded-full transition-[width] duration-300"
                      style={{
                        width: `${
                          ((post.study.currentParticipants || 0) /
                            post.study.maxParticipants) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* 스터디 설명 */}
                <div className="mb-6">
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {post.study.description}
                  </p>
                </div>

                {/* 호스트 정보 */}
                <div className="flex items-center gap-3 p-3 bg-ink/5 rounded-lg mb-6">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getProfileImageUrl(post.author?.avatarUrl)}
                      alt={post.author?.username || ""}
                    />
                    <AvatarFallback className="bg-ink text-paper text-xs">
                      {post.author?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-xs text-ink-soft">호스트</p>
                    <p className="font-semibold text-ink text-sm">
                      {post.author?.username}
                    </p>
                  </div>
                </div>

                {/* 액션 버튼 — 개인 참여 상태 × 모집 상태 */}
                <ParticipantActionSlot
                  myStatus={myStatus}
                  recruitment={recruitment}
                  studyId={post.study.id}
                  participant={participantData ?? null}
                  isOwner={isOwner}
                  chatRoomId={chatRoomId}
                />
              </Card>
            </div>
    )
}