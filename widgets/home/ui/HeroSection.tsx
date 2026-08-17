/*
  ┌─ DIRECTION CONTRACT · 스터디 플래너 월드 (seed key: a50580a1 / FORM: grounded #3) ─────────
  THESIS: 홈은 '살아있는 스터디 플래너'다 — 찾는 스터디는 이번 주 내가 채울 다음 칸이다.
          옅고 평평한 SaaS 히어로+카드 그리드를 거부한다.
  OWN-WORLD: 따뜻한 종이 바탕(플레인, 전면 그리드는 제너릭 시그니처라 배제), 형광펜 카테고리 코딩(옐로·민트·코랄·라벤더),
          먹빛 잉크 텍스트 + 굵은 마커 강조, D-day·체크리스트·좌석(참여) 블록. 카테고리 = 탭 일러스트.
  STORY: 방문자는 스터디를 '이번 주를 채울 블록'으로 보고 → 계획의 리듬을 느끼며 → 찾고/신청한다.
  FIRST VIEWPORT: 좌측 헤드라인(형광펜 강조)+원스톱 체크리스트+CTA+실데이터 스탯 / 우측 주간
          플래너 카드(형광 코딩 스터디 블록 + '빈 칸 채우기' CTA 행).
  FORM: 스터디 플래너 · 내 resonance 순위 3번째(주사위 지정) · seed a50580a1.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
          the verdict, and DESIGN.md.
  ※ 현재는 '히어로 우선' 증명 단계 — 나머지 홈 섹션은 승인 후 같은 월드로 전파. DESIGN.md는 전파 완료 후 갱신.
  └────────────────────────────────────────────────────────────────────────────────────── */

import { createClient } from "@/shared/api/supabase/server"
import { tryAuth } from "@/shared/lib/auth"
import { Button } from "@/shared/shadcn/ui/button"
import { ArrowRight, Check, Plus } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import HeroStats, { HeroStatsSkeleton } from "./HeroStats"

// 원스톱 흐름 = 플래너 체크리스트로. 순서 자체가 제품의 차별점.
const FLOW = ["발견", "신청", "승인", "대화"]

// 히어로 플래너 카드에 놓을 예시 스터디 블록(데모용 — 실데이터 아님, 월드를 보여주는 목업).
// 형광펜 색으로 카테고리를 코딩한다.
const PLAN_BLOCKS = [
  { hl: "bg-hl-yellow", title: "알고리즘 코테 스터디", when: "월·수 20:00", cur: 3, max: 6 },
  { hl: "bg-hl-mint", title: "토익 900+ 목표반", when: "화·목 19:00", cur: 4, max: 6 },
  { hl: "bg-hl-coral", title: "CS 전공 지식 스터디", when: "토 10:00", cur: 2, max: 8 },
]

async function getHeroUsername(): Promise<string | null> {
  const supabase = await createClient()
  const auth = await tryAuth(supabase)
  if (!auth.success) return null
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", auth.user.id)
    .single()
  return data?.username ?? null
}

export default async function HeroSection() {
  const username = await getHeroUsername()

  return (
    <section className="bg-paper border-b-2 border-paper-line px-4 py-16 text-ink sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid animate-fade-in items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* 좌: 헤드라인 + 원스톱 체크리스트 + CTA + 실데이터 스탯 */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-5">
              <h1 className="font-heading text-balance text-5xl font-normal leading-[1.12] text-ink md:text-6xl lg:text-7xl">
                {username ? (
                  <>
                    {username}님의 이번 주,
                    <br className="hidden sm:block" /> 무엇을 <span className="hl-mark">채워볼까요?</span>
                  </>
                ) : (
                  <>
                    이번 주,
                    <br className="hidden sm:block" /> 어떤 스터디로 <span className="hl-mark">채울까?</span>
                  </>
                )}
              </h1>
              <p className="mx-auto max-w-xl text-pretty text-lg leading-relaxed text-ink-soft lg:mx-0">
                관심 분야로 나에게 맞는 스터디를 찾고, 신청부터 승인, 그룹 채팅까지
                한 곳에서 이어가요.
              </p>
            </div>

            {/* 원스톱 흐름 = 체크리스트 */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 lg:justify-start">
              {FLOW.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink/15 bg-paper px-2.5 py-1 text-sm font-semibold text-ink">
                    <Check className="h-3.5 w-3.5 text-ink" strokeWidth={3} />
                    {step}
                  </span>
                  {i < FLOW.length - 1 && <ArrowRight className="h-4 w-4 text-ink/30" />}
                </div>
              ))}
              <span className="text-sm font-medium text-ink-soft">한 곳에서 이어져요</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-ink px-8 py-6 text-lg text-paper transition-transform hover:bg-ink/90 active:scale-[0.97]">
                <Link href="/posts">스터디 찾기</Link>
              </Button>
              <Button asChild size="lg" className="border-2 border-ink/20 bg-transparent px-8 py-6 text-lg text-ink transition-transform hover:bg-ink/5 active:scale-[0.97]">
                <Link href={username ? "/profile" : "/studies/create"}>
                  {username ? "내 활동" : "스터디 만들기"}
                </Link>
              </Button>
            </div>

            <Suspense fallback={<HeroStatsSkeleton />}>
              <HeroStats />
            </Suspense>
          </div>

          {/* 우: 주간 플래너 카드 — 스터디 = 이번 주 채울 칸 */}
          <div className="relative">
            {/* 종이 카드(살짝 기운 손으로 놓은 느낌) */}
            <div className="rotate-1 rounded-2xl border-2 border-ink/15 bg-paper p-5 shadow-lift md:p-6">
              <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-paper-line pb-3">
                <p className="text-lg font-bold text-ink">이번 주 스터디 계획</p>
                <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-paper">
                  D-6
                </span>
              </div>

              <ul className="space-y-2.5">
                {PLAN_BLOCKS.map((b) => (
                  <li
                    key={b.title}
                    className="flex items-center gap-3 rounded-lg border border-paper-line bg-paper px-3 py-2.5">
                    {/* 형광펜 카테고리 바 */}
                    <span className={`h-9 w-1.5 shrink-0 rounded-full ${b.hl}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{b.title}</p>
                      <p className="text-xs text-ink-soft">{b.when}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-ink/5 px-2 py-1 text-xs font-bold tabular-nums text-ink">
                      {b.cur}/{b.max}석
                    </span>
                  </li>
                ))}

                {/* 빈 칸 — 채우기 CTA */}
                <li>
                  <Link
                    href="/posts"
                    className="group flex items-center gap-3 rounded-lg border-2 border-dashed border-ink/25 px-3 py-2.5 text-ink-soft transition-colors hover:border-ink/50 hover:text-ink">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-ink/25 text-ink/50 group-hover:border-ink/50">
                      <Plus className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <span className="flex-1 text-sm font-semibold">
                      빈 칸에 새 스터디를 채워보세요
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Suspense 폴백 — 실제 구조·높이를 맞춰 CLS 방지.
export function HeroSectionSkeleton() {
  return (
    <section className="bg-paper border-b-2 border-paper-line px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-12 w-3/4 animate-pulse rounded-md bg-paper-line md:h-14 lg:h-16" />
              <div className="h-12 w-1/2 animate-pulse rounded-md bg-paper-line md:h-14 lg:h-16" />
              <div className="space-y-2 pt-2">
                <div className="h-5 w-full animate-pulse rounded-md bg-paper-line" />
                <div className="h-5 w-2/3 animate-pulse rounded-md bg-paper-line" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-[60px] w-40 animate-pulse rounded-md bg-paper-line" />
              <div className="h-[60px] w-40 animate-pulse rounded-md bg-paper-line" />
            </div>
            <HeroStatsSkeleton />
          </div>
          <div className="rotate-1 rounded-2xl border-2 border-ink/15 bg-paper p-6">
            <div className="mb-4 h-6 w-40 animate-pulse rounded-md bg-paper-line" />
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-paper-line" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
