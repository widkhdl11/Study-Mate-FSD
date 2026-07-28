'use client'

import { useParticipantStatus, ParticipantResponse } from "@/entities/participant"
import { usePostDetail, PostDetailView } from "@/entities/post"
import { getProfileImageUrl } from "@/shared/api/supabase/storage"
import { getRegionPath } from "@/shared/config/region"
import { getCategoryPath } from "@/shared/config/study-category"
import { PARTICIPANT_STATUS_MAP } from "@/shared/lib/conversion/participants"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Card } from "@/shared/shadcn/ui/card"
import { ParticipantActionSlot } from "./ParticipantActionSlot"

export default function SidebarSection({ postData, participant }: { 
  postData: PostDetailView, participant: ParticipantResponse | null
}) {

    const { data: post } = usePostDetail(postData)

    const {data : participantData} = useParticipantStatus(participant, post.study.id);
    
    const status = PARTICIPANT_STATUS_MAP[participantData?.status || ""] || "모집중";
    return (
         <div className="lg:col-span-1">
              {/* 스터디 정보 카드 */}
              <Card className="p-6 sticky top-20 shadow-md">
                {/* 상태 배지 */}
                <div className="mb-4">
                  <Badge
                    className={`text-white ${
                      status === "모집중"
                        ? "bg-success"
                        : status === "스터디 종료"
                        ? "bg-danger"
                        : "bg-warning"
                    }`}
                  >
                    {status}
                  </Badge>
                </div>

                {/* 스터디 제목 */}
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {post.study.title}
                </h2>

                {/* 카테고리 & 위치 배지 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {getCategoryPath(Number(post.study.studyCategory)).labels.map((category) => (
                    <Badge variant="outline" key={category} className="text-xs font-normal">{category}</Badge>
                  ))}
                    <Badge variant="outline"  className="text-xs font-normal">{getRegionPath(Number(post.study.region)).labels.join(" ")}</Badge>
                </div>

                {/* 참여 인원 진행률 */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      참여 인원
                    </span>
                    <span className="text-sm font-semibold text-accent">
                      {post.study.currentParticipants || 0}/
                      {post.study.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full"
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
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {post.study.description}
                  </p>
                </div>

                {/* 호스트 정보 */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-6">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getProfileImageUrl(post.author?.avatarUrl)}
                      alt={post.author?.username || ""}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {post.author?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">호스트</p>
                    <p className="font-semibold text-foreground text-sm">
                      {post.author?.username}
                    </p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <ParticipantActionSlot
                  status={status} 
                  studyId={post.study.id}
                />
              </Card>
            </div>
    )
}