import { Button } from "@/shared/shadcn/ui/button";
import { Edit } from "lucide-react";

export default function EditButton({ postId }: { postId: number }) {
    return (
        <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1 bg-transparent"
            >
            <Edit className="w-3 h-3" />
            수정
        </Button>
    )
}