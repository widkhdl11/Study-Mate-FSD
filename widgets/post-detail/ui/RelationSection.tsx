import { PostWithRelationResponse } from "@/entities/post"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Button } from "@/shared/shadcn/ui/button"
import { Card } from "@/shared/shadcn/ui/card"
import Image from "next/image"


export default function RelationSection({ relatedPosts }: { relatedPosts: PostWithRelationResponse[] }) {
    return (
         <div className="mt-12 pt-8 border-t-2 border-dashed border-paper-line">
              <h3 className="font-heading text-2xl font-normal text-ink mb-6">
                같은 스터디의 다른 모집글
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card
                    key={relatedPost.id}
                    className="overflow-hidden bg-paper border-2 border-ink/15 rounded-xl shadow-soft transition-all hover:-translate-y-1 hover:border-ink/40 hover:shadow-lift"
                  >
                    <div className="relative w-full h-40">
                      <Image
                        src={relatedPost.imageUrl[0].url || "/placeholder.svg"}
                        alt={relatedPost.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-ink flex-1">
                          {relatedPost.title}
                        </h4>
                        <Badge
                          className={`ml-2 rounded-md font-bold text-ink ${
                            relatedPost.study.status === "모집중"
                              ? "bg-hl-mint"
                              : "bg-hl-coral"
                          }`}
                        >
                          {relatedPost.study.status}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-0 h-auto text-ink hover:text-ink/60"
                      >
                        → 상세보기
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
    )
}