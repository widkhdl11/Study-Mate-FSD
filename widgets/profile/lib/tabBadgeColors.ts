// 프로필 탭 뱃지 색상 매핑 (모집글/스터디 탭 공용)
// 케빈스룸 단일 블루 정체성: 카테고리는 중립 배지, 상태는 의미 토큰(success/danger)

const STATUS_COLORS: Record<string, string> = {
    '모집중': 'bg-success text-white',
    '마감': 'bg-danger text-white',
}

export const getStatusColor = (status: string) =>
    STATUS_COLORS[status] || 'bg-muted text-muted-foreground'

// 카테고리는 단일 블루 정체성 유지를 위해 색으로 구분하지 않고 중립 배지로 통일
export const getCategoryColor = (_category: string) =>
    'bg-muted text-muted-foreground border-0'
