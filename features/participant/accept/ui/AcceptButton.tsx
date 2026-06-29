'use client'

import { ParticipantResponse } from "@/entities/participant";
import { Button } from "@/shared/shadcn/ui/button";
import { UserCheck } from "lucide-react";
import { useAcceptParticipant } from "../model/useAcceptParticipant";

type Props = {
  participant: ParticipantResponse;
  studyId: number;
};

export default function AcceptButton({ participant, studyId }: Props) {
    const { mutate : acceptMutation, isPending } = useAcceptParticipant(studyId)
    return (
         <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 gap-1"
            onClick={() => {
                if (
                window.confirm(
                    `${participant.username}님의 참여 신청을 수락하시겠습니까?`
                )
                ) {
                acceptMutation(participant.id);
                }
            }}
            disabled={isPending}
            >
            <UserCheck className="w-3 h-3" />
            수락
            </Button>
    )
}