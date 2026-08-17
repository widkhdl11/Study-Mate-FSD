import { Button } from "@/shared/shadcn/ui/button"
import { Users } from "lucide-react"
import Link from "next/link"

export default function HeaderSection() {
    return (
       <section className="border-b-2 border-ink/10 bg-paper py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <h1 className="font-heading text-3xl font-normal text-ink">
                  스터디 찾기
                </h1>
                <p className="text-ink-soft text-lg">
                  함께 성장할 동료를 만나보세요
                </p>
              </div>
              <Link href="/posts/create">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-ink text-paper hover:bg-ink/90 active:scale-[0.97] font-semibold gap-2 shadow-soft"
                >
                  <Users className="w-4 h-4" />새 모집글 작성
                </Button>
              </Link>
            </div>
          </div>
        </section>
    )
}