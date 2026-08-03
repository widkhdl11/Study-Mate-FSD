import { ParticipantResponse } from "@/entities/participant";
import { Button } from "@/shared/shadcn/ui/button";
import { Trash2 } from "lucide-react";
import { useKickParticipant } from "../model/useKickParticipant";

export default function KickButton({ studyId, participant }: { studyId: number, participant: ParticipantResponse }) {
    const kickParticipant = useKickParticipant(studyId)
    return (
        <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive/80 bg-transparent"
            onClick={() => {
                if (
                window.confirm(
                    `${participant.username}님을 스터디에서 강퇴하시겠습니까?`
                )
                ) {
                kickParticipant.mutate(participant.id);
                }
            }}
            disabled={kickParticipant.isPending}
            >
        <Trash2 className="w-3 h-3" />
        강퇴
        </Button>
    )
}