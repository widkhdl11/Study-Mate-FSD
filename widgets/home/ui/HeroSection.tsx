import { Badge } from "@/shared/shadcn/ui/badge"
import { Button } from "@/shared/shadcn/ui/button"
import { Card } from "@/shared/shadcn/ui/card"
import { BookOpen, Sparkles, Target, Users, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import HeroStats, { HeroStatsSkeleton } from "./HeroStats"

// 우측 플로팅 피처 카드 — 블루 단일 계열 아이콘 타일 + float 딜레이 스태거
const FEATURE_CARDS: {
  icon: LucideIcon
  title: string
  desc: string
  gradient: string
  indent: boolean
  delay: string
}[] = [
  {
    icon: Users,
    title: "다양한 스터디",
    desc: "프론트엔드, 백엔드, AI, 디자인 등 다양한 분야의 스터디를 만나보세요",
    gradient: "from-[#2F58E0] to-[#1D40B4]",
    indent: false,
    delay: "0s",
  },
  {
    icon: BookOpen,
    title: "체계적인 학습",
    desc: "함께 공부하며 서로의 성장을 돕는 효과적인 학습 경험",
    gradient: "from-[#1D40B4] to-[#0E44B7]",
    indent: true,
    delay: "0.2s",
  },
  {
    icon: Target,
    title: "목표 달성",
    desc: "같은 목표를 가진 동료들과 함께 학습 목표를 이루세요",
    gradient: "from-[#0E44B7] to-[#002AA1]",
    indent: false,
    delay: "0.4s",
  },
]

export default function HeroSection() {
  return (
      // 케빈스룸 디자인 언어: 단일 지배 블루 풀 배경 + 흰 텍스트 (퍼플 제거)
      <section className="relative bg-gradient-to-br from-[#2F58E0] via-[#1D40B4] to-[#002AA1] py-20 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background decorative elements — 블루 계열 단일 정체성 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-20 right-10 w-96 h-96 bg-[#5B7CF0]/25 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />

            {/* Grid pattern overlay — 흰 라인 저투명 */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff14_1px,transparent_1px),linear-gradient(to_bottom,#ffffff14_1px,transparent_1px)] bg-[size:14px_24px]" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left content */}
              <div className="space-y-8 text-center lg:text-left animate-fade-in">
                <div className="inline-block">
                  <Badge className="bg-white/15 text-white border-0 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5 inline-block mr-1.5" />
                    함께 성장하는 커뮤니티
                  </Badge>
                </div>

                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-balance leading-tight">
                    Study Mate
                  </h1>
                  <p className="text-2xl md:text-3xl text-white/85 font-medium text-balance">
                    함께 성장하는 스터디 문화
                  </p>
                </div>

                <p className="text-base md:text-lg text-white/75 max-w-xl mx-auto lg:mx-0 text-pretty leading-relaxed">
                  당신의 학습 목표를 달성할 수 있는 최적의 스터디를 찾아보세요.
                  같은 목표를 가진 사람들과 함께라면, 학습은 더욱 즐겁고
                  효과적입니다.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Link href="/posts">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold shadow-sm transition-transform active:scale-[0.96] px-8 py-6 text-lg"
                    >
                      모집글 보기
                    </Button>
                  </Link>
                  <Link href="/studies/create">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-white/70 text-white hover:bg-white/10 bg-transparent font-semibold px-8 py-6 text-lg transition-transform active:scale-[0.96]"
                    >
                      스터디 만들기
                    </Button>
                  </Link>
                </div>

                {/* Stats — 실데이터, Suspense로 스트리밍 (히어로 페인트 비차단) */}
                <Suspense fallback={<HeroStatsSkeleton />}>
                  <HeroStats />
                </Suspense>
              </div>

              {/* Right decorative cards — 블루 위 흰 카드, 아이콘 타일 블루 단일 계열 */}
              <div className="relative lg:block">
                <div className="relative w-full max-w-lg mx-auto space-y-6">
                  {FEATURE_CARDS.map((card) => (
                    <Card
                      key={card.title}
                      className={`p-6 bg-white/95 backdrop-blur-sm border-0 shadow-sm animate-float ${card.indent ? "ml-8" : ""}`}
                      style={{ animationDelay: card.delay }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <card.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            {card.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
  )
}
