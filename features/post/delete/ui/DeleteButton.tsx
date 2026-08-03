'use client'

import { Button } from "@/shared/shadcn/ui/button";
import { Trash2 } from "lucide-react";
import { useDeletePost } from "../model/useDeletePost";

export default function DeleteButton({ postId }: { postId: number }) {
    const {mutate: deletePost, isPending} = useDeletePost();
    const handleDeletePost = () => {
        if (
            window.confirm(
                "게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
            )
        ) {
            deletePost(postId);
        }
    }
    return (
    <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive/80 gap-1 bg-transparent"
        onClick={handleDeletePost}
        disabled={isPending}
        >
        <Trash2 className="w-3 h-3" />
        삭제
        </Button>
    )
}