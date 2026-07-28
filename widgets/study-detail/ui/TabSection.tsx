'use client'


import { MemberRow, ParticipantResponse } from "@/entities/participant";
import { PostCardView, PostListItem } from "@/entities/post";
import { StudyDetailView, StudyInfo, StudyStatusBadge } from "@/entities/study";
import { ProfileResponse } from "@/entities/user";
import { AcceptButton } from "@/features/participant/accept";
import { KickButton } from "@/features/participant/kick";
import { RejectButton } from "@/features/participant/reject";
import { WithdrawButton } from "@/features/participant/withdraw";
import { CreatePostLink as CreateLink } from "@/features/post/create";
import { DeleteButton } from "@/features/post/delete";
import { EditButton } from "@/features/post/edit";
import { DeleteStudyButton } from "@/features/study/delete";
import { getProfileImageUrl } from "@/shared/api/supabase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Card } from "@/shared/shadcn/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn/ui/tabs";
import {
  FileText,
  MessageSquare,
  Users
} from "lucide-react";



export default function TabSection(
    { study, user }
    : 
    { study: StudyDetailView, user: ProfileResponse }
) {
    return (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
                <TabsTrigger value="overview" className="gap-2">
                  <FileText className="w-4 h-4 hidden sm:inline" />
                  개요
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2">
                  <Users className="w-4 h-4 hidden sm:inline" />
                  멤버 ({study.participants?.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="posts" className="gap-2">
                  <MessageSquare className="w-4 h-4 hidden sm:inline" />
                  모집글 ({study.posts?.length ?? 0})
                </TabsTrigger>
              </TabsList>

              {/* 개요 탭 */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">
                    스터디 소개
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {study.description}
                  </p>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">
                    호스트 정보
                  </h2>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage
                        src={getProfileImageUrl(study.creator.avatarUrl)}
                        alt={study.creator.email || ""}
                      />
                      <AvatarFallback className="bg-blue-600 text-white text-lg">
                        {study.creator.email}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground text-lg">
                        {study.creator.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {study.creator.email}
                      </p>
                    </div>
                  </div>
                </Card>

                <StudyInfo study={study} />
              </TabsContent>

              {/* 멤버 탭 */}
              <TabsContent value="members" className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                      멤버 관리
                    </h2>
                    <Badge variant="outline">
                      {study.currentParticipants ?? 0}/
                      {study.maxParticipants}명 참여중
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {study.participants?.map((participant : ParticipantResponse) => {
                        const isHost = !!user && user.id === study.creator.id;
                        const isSelf = !!user && user.id === participant.userId;
                        return (
                          <MemberRow
                            key={participant.id}
                            participant={participant}
                            actionSlot={
                              <>
                                {isHost && participant.status === "pending" && (
                                  <div className="flex gap-2">
                                    <AcceptButton participant={participant} studyId={study.id} />
                                    <RejectButton participant={participant} studyId={study.id} />
                                  </div>
                                )}
                                {isHost && participant.status === "accepted" && participant.userId !== study.creator.id && (
                                  <KickButton participant={participant} studyId={study.id} />
                                )}
                                {isSelf && participant.status === "accepted" && (
                                  isHost ? <DeleteStudyButton studyId={study.id} />
                                        : <WithdrawButton participant={participant} studyId={study.id} />
                                )}
                              </>
                            }
                          />
                        );
                      })}
                  </div>
                </Card>
              </TabsContent>

              {/* 모집글 탭 */}
              <TabsContent value="posts" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    모집글 목록
                  </h2>
                  <CreateLink studyId={study.id} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {study.posts?.map((post: PostCardView) => {
                    return (
                     <PostListItem
                      key={post.id}
                      post={post}
                      badgeSlot={<StudyStatusBadge status={study.status} />}
                      actionSlot={
                     <>
                      <EditButton postId={post.id} /> 
                      <DeleteButton postId={post.id} />
                      </>
                     } 
                     />
                  )})}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
    )
}