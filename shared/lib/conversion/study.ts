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
// 플래너 월드: 형광펜 코딩(모집중=민트, 마감=코랄, 대기=옐로), 글자는 항상 잉크.
export const getStudyStatusColor = (status: string) => {
    switch (status) {
        case "recruiting":
            return "bg-hl-mint text-ink";
        case "closed":
            return "bg-hl-coral text-ink";
        case "pending":
            return "bg-hl-yellow text-ink";
        case "completed":
            return "bg-ink/10 text-ink-soft";
        default:
            return "bg-ink/10 text-ink-soft";
    }
};

