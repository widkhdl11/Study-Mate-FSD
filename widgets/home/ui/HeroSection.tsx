import { Button } from "@/shared/shadcn/ui/button"
import { CheckCircle2, MessageCircle, Search, UserPlus, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import HeroStats, { HeroStatsSkeleton } from "./HeroStats"

// Study Mate의 차별점 = 원스톱 흐름(발견→신청→승인→대화).
// 히어로 우측에 generic 피처 카드 대신 이 실제 흐름을 보여줘 정체성을 앞세운다.
const FLOW_STEPS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Search, title: "발견", desc: "관심 분야·지역으로 나에게 맞는 스터디를 찾아요" },
  { icon: UserPlus, title: "신청", desc: "마음에 드는 모집글에 참가를 신청해요" },
  { icon: CheckCircle2, title: "승인", desc: "스터디장이 수락하면 멤버가 돼요" },
  { icon: MessageCircle, title: "대화", desc: "그룹 채팅방에서 바로 대화를 시작해요" },
]

export default function HeroSection() {
  return (
    // Border-First: 풀블리드 그라디언트/오브/그리드 대신 은은한 브랜드 틴트 + 하단 테두리로 구획
    <section className="border-b border-border bg-secondary px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid animate-fade-in items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* 좌: 슬로건 + 사실 기반 카피 + CTA + 실데이터 스탯 */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
                함께 성장하는
                <br className="hidden sm:block" /> 스터디 문화
              </h1>
              <p className="mx-auto max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground lg:mx-0">
                관심 분야와 지역으로 나에게 맞는 스터디를 찾고, 신청부터 승인,
                그룹 채팅까지 한 곳에서 이어가요.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="px-8 py-6 text-lg transition-transform active:scale-[0.97]">
                <Link href="/posts">모집글 보기</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 py-6 text-lg transition-transform active:scale-[0.97]">
                <Link href="/studies/create">스터디 만들기</Link>
              </Button>
            </div>

            {/* 실데이터 스탯 — 스트리밍(히어로 페인트 비차단) */}
            <Suspense fallback={<HeroStatsSkeleton />}>
              <HeroStats />
            </Suspense>
          </div>

          {/* 우: 실제 원스톱 흐름 — 순서 자체가 정보라 세로 연결선으로 표현 */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <p className="mb-6 text-sm font-semibold text-foreground">
              발견부터 대화까지, 한 흐름으로
            </p>
            <ol>
              {FLOW_STEPS.map((step, i) => (
                <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < FLOW_STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-5 top-11 bottom-0 w-px bg-border"
                    />
                  )}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="pt-1.5">
                    <p className="font-semibold text-foreground">{step.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
