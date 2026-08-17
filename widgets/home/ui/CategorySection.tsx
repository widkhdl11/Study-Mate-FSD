import { getMainCategories } from "@/shared/config/study-category"
import { Card } from "@/shared/shadcn/ui/card"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// 대분류 value → 형광펜 색(카테고리 코딩). 플래너 탭의 색이자, 손그림 스티커의 배경 색면.
// 대분류 8종 = 서로 겹치지 않는 8개 고유 형광색.
const CATEGORY_HL: Record<string, string> = {
    IT_DEVELOPMENT: "bg-hl-sky",
    DESIGN: "bg-hl-coral",
    LANGUAGE: "bg-hl-mint",
    BUSINESS: "bg-hl-yellow",
    CERTIFICATION: "bg-hl-lavender",
    ACADEMICS: "bg-hl-orange",
    HOBBY: "bg-hl-pink",
    SELF_IMPROVEMENT: "bg-hl-lime",
}

// 일러스트 밴드용 옅은 음영(8% 워시, 쨍한 색면이 아닌 카드별 구분용) — 클래스 전체 문자열을 리터럴로 둬야 Tailwind가 인식함
const CATEGORY_BAND_TINT: Record<string, string> = {
    IT_DEVELOPMENT: "bg-hl-sky/8",
    DESIGN: "bg-hl-coral/8",
    LANGUAGE: "bg-hl-mint/8",
    BUSINESS: "bg-hl-yellow/8",
    CERTIFICATION: "bg-hl-lavender/8",
    ACADEMICS: "bg-hl-orange/8",
    HOBBY: "bg-hl-pink/8",
    SELF_IMPROVEMENT: "bg-hl-lime/8",
}

export default function CategorySection() {
    const categories = getMainCategories()

    return (
        <section className="bg-paper px-4 py-16 text-ink sm:px-6 md:py-20 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="space-y-2">
                    <h2 className="font-heading text-3xl font-normal text-ink md:text-4xl">
                        <span className="hl-mark-mint">관심 분야</span>로 찾기
                    </h2>
                    <p className="text-ink-soft">카테고리 탭을 골라 바로 스터디를 둘러보세요</p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {categories.map((cat) => {
                        const hl = CATEGORY_HL[cat.value] ?? "bg-hl-yellow"
                        const bandTint = CATEGORY_BAND_TINT[cat.value] ?? "bg-hl-yellow/8"
                        return (
                            <Link key={cat.value} href={`/posts?category=${cat.value}`}>
                                <Card className="group relative h-full gap-0 overflow-hidden rounded-xl border-2 border-ink/15 bg-paper p-0 shadow-soft transition-all hover:-translate-y-1 hover:border-ink/40 hover:shadow-lift active:scale-[0.98] cursor-pointer">
                                    {/* 카테고리 색 코딩 = 좌측 형광 바 액센트(밴드는 차분한 종이 톤) */}
                                    <span className={`absolute left-0 top-0 z-10 h-full w-1.5 ${hl}`} aria-hidden="true" />
                                    {/* 카테고리 스티커 일러스트 밴드 — 카테고리 고유 형광색 옅은 음영(쨍한 색면이 아닌 8% 워시) */}
                                    <div className={`relative flex h-28 items-center justify-center overflow-hidden ${bandTint}`}>
                                        <Image
                                            src={`/categories/${cat.value.toLowerCase()}.png`}
                                            alt=""
                                            width={80}
                                            height={80}
                                            className="h-[4.5rem] w-[4.5rem] object-contain drop-shadow-[0_1px_1px_rgba(31,41,51,0.12)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 pl-5">
                                        <span className="flex items-center gap-2 font-bold text-ink">
                                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${hl}`} aria-hidden="true" />
                                            {cat.label}
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-ink/40 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                                    </div>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
