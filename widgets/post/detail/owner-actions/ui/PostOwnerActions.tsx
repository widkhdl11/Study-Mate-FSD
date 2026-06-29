'use client'

import { useDeletePost } from "@/features/post/delete/model/useDeletePost";
import { Button } from "@/shared/shadcn/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/shadcn/ui/dropdown-menu";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";


export default function PostOwnerActions({ postId }: { postId: number }) {
    const { mutate: deletePost, isPending } = useDeletePost();

    const handleDelete = () => {
        if (confirm("게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            deletePost(postId);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="더보기"
                >
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/posts/${postId}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        수정
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-red-600 focus:text-red-600"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
