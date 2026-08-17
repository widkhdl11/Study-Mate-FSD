import { Button } from "@/shared/shadcn/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function CreatePostLink({ studyId }: { studyId: number }) {
    return (
        <Link href={`/posts/create?study_id=${studyId}`}>
            <Button className="bg-ink text-paper hover:bg-ink/90 active:scale-[0.97] gap-2">
                <PlusCircle className="w-4 h-4" />새 모집글 작성
            </Button>
        </Link>
    )
}