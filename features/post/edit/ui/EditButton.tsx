import { Button } from "@/shared/shadcn/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";

export default function EditButton({ postId }: { postId: number }) {
    return (
        <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 gap-1 bg-transparent"
            >
            <Link href={`/posts/${postId}/edit`}>
                <Edit className="w-3 h-3" />
                수정
            </Link>
        </Button>
    )
}
