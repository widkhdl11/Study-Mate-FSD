import type { ParticipantResponse } from "@/entities/participant/model/types";
import { getProfileImageUrl } from "@/shared/api/supabase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";
import { Badge } from "@/shared/shadcn/ui/badge";
import type { ReactNode } from "react";


interface MemberRowProps{
  participant: ParticipantResponse;
  statusBadgeSlot?: ReactNode;
  actionSlot?: ReactNode;
}

export default function MemberRow({ participant, statusBadgeSlot, actionSlot }: MemberRowProps) {
  return (
    <div
      key={participant.id}
      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={getProfileImageUrl(participant?.avatarUrl || "")}
            alt={participant.username}
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {participant.username}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">
              {participant.username}
            </p>
            {participant.role === "host" && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                호스트
              </Badge>
            )}
            {participant.role === "common" && (
              <Badge className="bg-success text-white text-xs">
                멤버
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            가입일: {participant.createdAt}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {statusBadgeSlot}
        {actionSlot}
      </div>
    </div>
  );
}
