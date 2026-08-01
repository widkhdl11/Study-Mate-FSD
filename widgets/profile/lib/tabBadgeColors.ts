// 프로필 탭 뱃지 색상 매핑 (모집글/스터디 탭 공용)

const STATUS_COLORS: Record<string, string> = {
    '모집중': 'bg-green-500 text-white',
    '마감': 'bg-red-500 text-white',
}

const CATEGORY_COLORS: Record<string, string> = {
    프론트엔드: 'bg-blue-100 text-blue-700 border-blue-200',
    백엔드: 'bg-purple-100 text-purple-700 border-purple-200',
    AI: 'bg-amber-100 text-amber-700 border-amber-200',
    모바일: 'bg-green-100 text-green-700 border-green-200',
    디자인: 'bg-pink-100 text-pink-700 border-pink-200',
}

export const getStatusColor = (status: string) =>
    STATUS_COLORS[status] || 'bg-slate-500 text-white'

export const getCategoryColor = (category: string) =>
    CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-700 border-slate-200'
