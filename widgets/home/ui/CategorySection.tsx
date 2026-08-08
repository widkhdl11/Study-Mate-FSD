import { getMainCategories } from "@/shared/config/study-category"
import { Card } from "@/shared/shadcn/ui/card"
import {
    Award,
    Briefcase,
    Code2,
    Coffee,
    GraduationCap,
    Languages,
    Palette,
    Rocket,
    type LucideIcon,
} from "lucide-react"
import Link from "next/link"

// 대분류 value → 아이콘 매핑 (미정의 value는 Rocket 폴백)
const CATEGORY_ICONS: Record<string, LucideIcon> = {
    IT_DEVELOPMENT: Code2,
    DESIGN: Palette,
    LANGUAGE: Languages,
    BUSINESS: Briefcase,
    CERTIFICATION: Award,
    ACADEMICS: GraduationCap,
    HOBBY: Coffee,
    SELF_IMPROVEMENT: Rocket,
}

export default function CategorySection() {
    const categories = getMainCategories()

    return (
        <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                        관심 분야로 찾기
                    </h2>
                    <p className="text-muted-foreground">
                        카테고리를 골라 바로 스터디를 둘러보세요
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map((cat) => {
                        const Icon = CATEGORY_ICONS[cat.value] ?? Rocket
                        return (
                            <Link
                                key={cat.value}
                                href={`/posts?category=${cat.value}`}>
                                <Card className="group flex items-center gap-4 p-5 h-full hover:border-primary/50 transition-all active:scale-[0.98] cursor-pointer">
                                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-foreground">
                                        {cat.label}
                                    </span>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
