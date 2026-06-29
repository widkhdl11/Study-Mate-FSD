import { Button } from "@/shared/shadcn/ui/button"
import { Users } from "lucide-react"
import Link from "next/link"

export default function HeaderSection() {
    return (
       <section className="border-b border-border bg-card py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  스터디 찾기
                </h1>
                <p className="text-muted-foreground text-lg">
                  함께 성장할 동료를 만나보세요
                </p>
              </div>
              <Link href="/posts/create">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-sm"
                >
                  <Users className="w-4 h-4" />새 모집글 작성
                </Button>
              </Link>
            </div>
          </div>
        </section>
    )
}