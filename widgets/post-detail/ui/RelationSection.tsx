import { PostWithRelationResponse } from "@/entities/post"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Button } from "@/shared/shadcn/ui/button"
import { Card } from "@/shared/shadcn/ui/card"
import Image from "next/image"


export default function RelationSection({ relatedPosts }: { relatedPosts: PostWithRelationResponse[] }) {
    return (
         <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                같은 스터디의 다른 모집글
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card
                    key={relatedPost.id}
                    className="overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
                        <h4 className="font-semibold text-foreground flex-1">
                          {relatedPost.title}
                        </h4>
                        <Badge
                          className={`text-white ml-2 ${
                            relatedPost.study.status === "모집중"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {relatedPost.study.status}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-0 h-auto text-blue-600"
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