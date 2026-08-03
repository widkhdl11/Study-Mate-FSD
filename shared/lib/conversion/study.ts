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

// 스터디 상태 색상 반환 (입력 = status 코드, studyStatusConversion과 동일 도메인)
export const getStudyStatusColor = (status: string) => {
    switch (status) {
        case "recruiting":
            return "bg-success text-white";
        case "closed":
            return "bg-destructive text-white";
        case "pending":
            return "bg-warning text-foreground";
        case "completed":
            return "bg-muted-foreground text-white";
        default:
            return "bg-muted text-muted-foreground";
    }
};

