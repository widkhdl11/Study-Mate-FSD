import { Badge } from "@/shared/shadcn/ui/badge";
import { getStudyStatusColor, studyStatusConversion } from "@/shared/lib/conversion/study";



export function StudyStatusBadge({status}: {status: string}) {
    return(
        <Badge className={getStudyStatusColor(status)}>
            {studyStatusConversion(status)}
        </Badge>
    )
}