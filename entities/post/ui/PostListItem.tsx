import { PostCardView } from "@/entities/post/model/types";
import { getImageUrl } from "@/shared/api/supabase/storage";
import { Card } from "@/shared/shadcn/ui/card";
import { formatTimeAgo } from "@/shared/lib/date";
import { Eye, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PostListItemProps {
    post: PostCardView
    badgeSlot?: React.ReactNode
    actionSlot?: React.ReactNode
  }

export default function PostListItem({ post, badgeSlot, actionSlot }: PostListItemProps) {
    return (
        <Card
          key={post.id}
          className="overflow-hidden border-2 border-ink/15 bg-paper shadow-soft hover:-translate-y-1 hover:shadow-lift transition-all cursor-pointer p-0 gap-0"
        >
          <Link href={`/posts/${post.id}`}>
            <div className="relative w-full h-40 bg-paper-line">
              <Image
                fill
                src={getImageUrl(post.imageUrl?.[0]?.url || "/default-post-thumbnail.jpg")}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
           
                {badgeSlot}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-ink line-clamp-1">
                {post.title}
              </h3>
              <p className="text-sm text-ink-soft line-clamp-2">
                {post.content}
              </p>
              <div className="flex items-center justify-between text-sm text-ink-soft">
                <span>{ formatTimeAgo(post.createdAt)}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {post.viewsCount}
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <div className="px-4 pb-4 flex gap-2">
            {actionSlot}
            </div>
        </Card>
    )
}