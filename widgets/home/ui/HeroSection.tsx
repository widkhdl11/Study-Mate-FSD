import { Badge } from "@/shared/shadcn/ui/badge"
import { Button } from "@/shared/shadcn/ui/button"
import { Card } from "@/shared/shadcn/ui/card"
import { BookOpen, Sparkles, Target, Users } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 py-20 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left content */}
              <div className="space-y-8 text-center lg:text-left animate-fade-in">
                <div className="inline-block">
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 px-4 py-1.5 text-sm font-medium">
                    <Sparkles className="w-3.5 h-3.5 inline-block mr-1.5" />
                    함께 성장하는 커뮤니티
                  </Badge>
                </div>

                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground text-balance leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                      Study Mate
                    </span>
                  </h1>
                  <p className="text-2xl md:text-3xl text-muted-foreground font-medium text-balance">
                    함께 성장하는 스터디 문화
                  </p>
                </div>

                <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 text-balance leading-relaxed">
                  당신의 학습 목표를 달성할 수 있는 최적의 스터디를 찾아보세요.
                  같은 목표를 가진 사람들과 함께라면, 학습은 더욱 즐겁고
                  효과적입니다.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Link href="/studies/create">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg"
                    >
                      스터디 만들기
                    </Button>
                  </Link>
                  <Link href="/posts">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 bg-transparent font-semibold px-8 py-6 text-lg"
                    >
                      모집글 보기
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div className="text-center lg:text-left space-y-1">
                    <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                      2,340+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      활성 스터디
                    </div>
                  </div>
                  <div className="text-center lg:text-left space-y-1">
                    <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                      15,680+
                    </div>
                    <div className="text-sm text-muted-foreground">멤버</div>
                  </div>
                  <div className="text-center lg:text-left space-y-1">
                    <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                      98%
                    </div>
                    <div className="text-sm text-muted-foreground">만족도</div>
                  </div>
                </div>
              </div>

              {/* Right decorative cards */}
              <div className="relative lg:block">
                <div className="relative w-full max-w-lg mx-auto space-y-6">
                  {/* Feature Cards */}
                  <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-blue-100 dark:border-blue-900/30 hover:shadow-xl transition-all animate-float">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          다양한 스터디
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          프론트엔드, 백엔드, AI, 디자인 등 다양한 분야의
                          스터디를 만나보세요
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-purple-100 dark:border-purple-900/30 hover:shadow-xl transition-all animate-float ml-8"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          체계적인 학습
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          함께 공부하며 서로의 성장을 돕는 효과적인 학습 경험
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-indigo-100 dark:border-indigo-900/30 hover:shadow-xl transition-all animate-float"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          목표 달성
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          같은 목표를 가진 동료들과 함께 학습 목표를 이루세요
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
  )
}