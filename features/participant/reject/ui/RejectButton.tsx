import { ParticipantResponse } from "@/entities/participant";
import { Button } from "@/shared/shadcn/ui/button";
import { UserX } from "lucide-react";
import { useRejectParticipant } from "../model/useRejectParticipant";

export default function RejectButton({ studyId, participant }: { studyId: number, participant: ParticipantResponse }) {
    const rejectParticipant = useRejectParticipant(studyId)
    return (
        <Button
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={() => {
                if (
                window.confirm(
                    `${participant.username}님의 참여 신청을 거절하시겠습니까?`
                )
                ) {
                rejectParticipant.mutate(participant.id);
                }
            }}
            disabled={rejectParticipant.isPending}
            >
            <UserX className="w-3 h-3" />
            거절
            </Button>
    )
}