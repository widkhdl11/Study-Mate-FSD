import { STUDY_STATUS } from "@/shared/config/study-status";

export const studyStatusConversion = (status: string) => {   
    switch (status) {
        case "recruiting":
            return "모집중";
        case "completed":
            return "모집완료";
        case "closed":
            return "마감";
    }
};

// 
export const getStudyStatusExistValue = (status: string):string => {
    return Object.values(STUDY_STATUS).find((s: { label: string }) => s.label === status)?.value || "";
};

// 스터디 상태 색상 반환
export const getStudyStatusColor = (status: string) => {
switch (status) {
    case "모집중":    
    return "bg-success text-white";
    case "마감":
    return "bg-destructive text-white";
    case "참여중":
    return "bg-primary text-white";
    case "수락 대기중":
    return "bg-warning text-white";
    default:
    return "bg-muted-foreground text-white";
}
};

