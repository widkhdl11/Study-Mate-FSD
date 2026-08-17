// 프로필 탭 뱃지 색상 매핑 (모집글/스터디 탭 공용)
// 플래너 월드: 상태는 형광펜 코딩(모집중=민트, 마감=코랄, 그 외=잉크 약), 글자는 잉크

const STATUS_COLORS: Record<string, string> = {
    '모집중': 'bg-hl-mint text-ink',
    '마감': 'bg-hl-coral text-ink',
}

export const getStatusColor = (status: string) =>
    `rounded-md border-0 font-bold ${STATUS_COLORS[status] || 'bg-ink/10 text-ink-soft'}`

// 카테고리는 색으로 구분하지 않고 잉크 약면 칩으로 통일(형광펜은 상태 코딩 전용)
export const getCategoryColor = (_category: string) =>
    'rounded-md border-0 bg-ink/5 text-ink'
