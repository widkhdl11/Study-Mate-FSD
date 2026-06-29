import { ParticipantResponse } from "@/entities/participant";
import { Button } from "@/shared/shadcn/ui/button";
import { UserX } from "lucide-react";
import { useWithdrawParticipant } from "../model/useWithdrawParticipant";

export default function WithdrawButton({ studyId, participant }: { studyId: number, participant: ParticipantResponse }) {
    const withdrawParticipant = useWithdrawParticipant(studyId)
    return (
        <Button
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={() => {
            if (
                window.confirm(
                "참여 신청을 취소하시겠습니까?"
                )
            ) {
                withdrawParticipant.mutate(participant.id);
            }
            }}
            disabled={withdrawParticipant.isPending}
        >
            <UserX className="w-3 h-3" />
            신청 취소
        </Button>
    )
}