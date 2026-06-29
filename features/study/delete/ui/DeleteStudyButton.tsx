import { useDeleteStudy } from "@/features/study/delete/model/useDeleteStudy";
import { Button } from "@/shared/shadcn/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteStudyButton({ studyId }: { studyId: number }) {

    const {mutate: deleteStudy, isPending} = useDeleteStudy();

    const handleDeleteStudy = () => {
        if (
            window.confirm(
                "스터디를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
            )
        ) {
            deleteStudy(studyId);
        }
    }
    return (
       <Button
        size="sm"
        variant="destructive"
        className="gap-1"
        onClick={() => handleDeleteStudy()}
        disabled={isPending}
        >
        <Trash2 className="w-3 h-3" />
        스터디 삭제
    </Button>
    )
}