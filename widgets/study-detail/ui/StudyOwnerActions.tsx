'use client'

import { useDeleteStudy } from "@/features/study/delete";
import { Button } from "@/shared/shadcn/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/shadcn/ui/dropdown-menu";
import { MoreVertical, Settings, Trash2 } from "lucide-react";
import Link from "next/link";


export default function StudyOwnerActions({ studyId }: { studyId: number }) {
    const { mutate: deleteStudy, isPending } = useDeleteStudy();

    const handleDelete = () => {
        if (
            confirm(
                "정말 이 스터디를 삭제하시겠습니까? 모든 모집글과 채팅 기록이 함께 삭제됩니다."
            )
        ) {
            deleteStudy(studyId);
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
                    <Link href={`/studies/${studyId}/edit`}>
                        <Settings className="w-4 h-4 mr-2" />
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
