import { STUDY_STATUS } from "@/lib/constants/study-status";

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
    return "bg-green-500 text-white";
    case "마감":
    return "bg-red-500 text-white";
    case "참여중":
    return "bg-blue-500 text-white";
    case "수락 대기중":
    return "bg-yellow-500 text-white";
    default:
    return "bg-slate-500 text-white";
}
};

