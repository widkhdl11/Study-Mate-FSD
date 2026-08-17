import dynamic from 'next/dynamic'
import Image from "next/image"
import { getImageUrl } from "@/shared/api/supabase/storage"
import { PostDetailView } from "../api/query/postDetail/types"

const Carousel = dynamic(() => import('@/shared/shadcn/ui/carousel').then(mod => mod.Carousel))
const CarouselContent = dynamic(() => import('@/shared/shadcn/ui/carousel').then(mod => mod.CarouselContent))
const CarouselItem = dynamic(() => import('@/shared/shadcn/ui/carousel').then(mod => mod.CarouselItem))
const CarouselNext = dynamic(() => import('@/shared/shadcn/ui/carousel').then(mod => mod.CarouselNext))
const CarouselPrevious = dynamic(() => import('@/shared/shadcn/ui/carousel').then(mod => mod.CarouselPrevious))

export default function PostImageSection({ postData }: { postData: PostDetailView }) {
    return (
        <div className="relative w-full mb-8">
            <Carousel className="w-full">
              <CarouselContent >
                {postData.imageUrl.length > 0 ? (
                  <>
                  {postData.imageUrl.map((image: { url: string }, index: number) => (
                    <CarouselItem key={index}>
                      <div className="relative w-full h-96 rounded-xl overflow-hidden border-2 border-ink/15 shadow-soft" >
                        <Image
                          src={getImageUrl(image.url)}
                          alt={`${postData.title} - 이미지 ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 576px) 100vw, (max-width: 768px) 50vw, 33vw"
                          priority={index === 0}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          />
                      </div>
                    </CarouselItem>
                  ))}
                </>
              ) : (
                <CarouselItem>
                  <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={getImageUrl("/default-post-thumbnail.jpg")}
                      alt={`default-post-thumbnail`}
                      fill
                      className="object-cover"
                      />
                  </div>
                </CarouselItem>
              )}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
    )
}
