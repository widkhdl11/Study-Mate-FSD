import { Button } from "@/shared/shadcn/ui/button"
import Link from "next/link"

// 홈을 닫는 잉크(마커) 밴드 — 플래너 월드의 강한 색 앵커(딥블루 대체).
export default function CtaSection() {
    return (
        <section className="bg-paper px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border-2 border-ink bg-ink px-6 py-14 text-center text-paper sm:px-10 md:py-20">
                <div className="mx-auto max-w-2xl space-y-4">
                    <h2 className="font-heading text-3xl font-normal text-paper md:text-4xl">
                        이번 주, 스터디 한 칸 <span className="hl-mark">채워볼까요?</span>
                    </h2>
                    <p className="text-pretty text-lg leading-relaxed text-paper/75">
                        관심 분야로 나에게 맞는 스터디를 찾거나, 직접 만들어 동료를 모아보세요.
                    </p>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button
                        asChild
                        size="lg"
                        className="bg-paper px-8 py-6 text-lg text-ink transition-transform hover:bg-paper/90 active:scale-[0.97]">
                        <Link href="/posts">스터디 찾기</Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        className="border-2 border-paper/40 bg-transparent px-8 py-6 text-lg text-paper transition-transform hover:bg-paper/10 active:scale-[0.97]">
                        <Link href="/studies/create">스터디 만들기</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
