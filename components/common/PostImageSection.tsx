import { PostDetailView } from "@/entities/post/api/query/postDetail/view"
import { getImageUrl } from "@/shared/api/supabase/storage"
// import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/shared/shadcn/ui/carousel"
import dynamic from 'next/dynamic'
import Image from "next/image"

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
                      <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg" >
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
            
            {/* 이미지 카운터 */}
            {/* <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {post.image_url.length}
            </div> */}
         
          </div>
    )
}