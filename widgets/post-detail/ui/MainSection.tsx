'use client'

import { usePostDetail, PostDetailView, useIsLiked } from "@/entities/post";
import { ProfileResponse } from "@/entities/user";
import { useToggleLike } from "@/features/post/like";
import { useTrackPostView } from "@/features/post/track-view";
import { getProfileImageUrl } from "@/shared/api/supabase/storage";
import TimeAgo from "@/shared/common/FormatTimeAgo";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";
import { Button } from "@/shared/shadcn/ui/button";
import PostOwnerActions from "./PostOwnerActions";
import { Eye, ThumbsUp } from "lucide-react";
import { useRef } from "react";

export default function MainSection({ postData,user }: { postData: PostDetailView, user: ProfileResponse | null }) {
    const { data: post } = usePostDetail(postData);

    const { mutate: toggleLikeMutation, isPending: isTogglingLike } = useToggleLike(post.id);

    const { data: isLikedData } = useIsLiked(post.id);
    const isLiked = isLikedData || false;
    const { shouldAddView } = useTrackPostView(post.id);

    const isProcessingRef = useRef(false);

    const handleLikeClick = () => {
        if (!user || isProcessingRef.current) return;
        isProcessingRef.current = true;
        
        toggleLikeMutation(undefined, {
            onSettled: () => {
            isProcessingRef.current = false;
            }
        });
    };
    return (
        <div className="lg:col-span-2">
              {/* 포스트 제목 */}
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {post.title}
              </h1>

              {/* 작성자 정보 및 메타정보 */}
              <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={getProfileImageUrl(post.author?.avatarUrl ?? "")}
                      alt={post.author?.username || ""}
                      width={60}
                      height={60}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {post.author?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      {post.author?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <TimeAgo date={post.createdAt} />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleLikeClick()}
                    disabled={isTogglingLike}
                    className={`gap-2 ${isLiked ? "bg-primary/5 border-primary text-primary" : ""}`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-primary" : ""}`} />
                    <span className="font-semibold">{post.likesCount}</span>
                  </Button>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground tabular-nums">
                    <Eye className="h-4 w-4" />
                    {post.viewsCount + (shouldAddView ? 1 : 0)}
                  </span>
                  {user?.id === post.author?.id && (
                    <PostOwnerActions postId={post.id} />
                  )}
                </div>
              </div>

              {/* 포스트 내용 */}
              <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
                <div className="text-foreground whitespace-pre-line leading-relaxed">
                  {post.content}
                </div>
              </div>
            </div>
    )
}