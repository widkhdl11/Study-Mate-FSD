'use client'

import { StudySelectSkeleton } from "@/components/skeleton";
import { PostDetailView, UpdatePostCommand, updatePostSchema } from "@/entities/post";
import { StudyResponse, StudySelect } from "@/entities/study";
import { zodResolverFirstError } from "@/shared/lib/validation";
import { Button } from "@/shared/shadcn/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/shadcn/ui/form";
import { Input } from "@/shared/shadcn/ui/input";
import { Textarea } from "@/shared/shadcn/ui/textarea";
import { ImageUploadField } from "@/shared/ui/ImageUploadField";
import { Link } from "lucide-react";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { useUpdatePost } from "../model/useUpdatePost";


export default function PostUpdateForm(
    { postData, studiesPromise }: {postData: PostDetailView, studiesPromise: Promise<StudyResponse[]>; }
) {
      const form = useForm<UpdatePostCommand>({
      resolver: zodResolverFirstError(updatePostSchema),
      defaultValues: {
        ...postData,  
        studyId: postData.study.id, 
        images: postData.imageUrl.map((image) => new File([], image.url)) as File[] || [],
      },
    })

    const {mutate: updatePostMutation, isPending} = useUpdatePost((field ,message)=>{
      form.setError(field as keyof UpdatePostCommand, {
        type: "server",
        message,
      });
    });


  async function onSubmit(values: UpdatePostCommand) {
    console.log("values : ", values);
    updatePostMutation(values);
  }
    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" >

              <FormField
                control={form.control}
                name="title"
                render={({field})=>(
                  <FormItem>
                    <FormLabel>게시글 제목</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="게시글 제목을 입력해주세요"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 스터디 선택 */}
              <FormField
                    control={form.control}
                    name='studyId'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>스터디 선택 *</FormLabel>
                            <FormDescription>
                                모집글을 작성할 스터디를 선택해주세요
                            </FormDescription>
                            <Suspense fallback={<StudySelectSkeleton />}>
                                <StudySelect
                                    studiesPromise={studiesPromise}
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={isPending}
                                />
                            </Suspense>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              {/* 내용 */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용 *</FormLabel>
                    <FormDescription>모집글의 상세한 내용을 입력해주세요 (최소 10자)</FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="스터디에 대한 상세한 설명을 입력하세요"
                        disabled={isPending}
                        rows={6}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 이미지 업로드 */}
              <ImageUploadField
                control={form.control}
                name="images"
                existingImages={form.getValues("images").map((file) => file.name)}
                disabled={isPending}
              />
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
                  {isPending ? "수정 중..." : "수정 완료"}
                </Button>
                <Link href={`/posts/${postData.id}`} className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent" disabled={isPending}>
                    취소
                  </Button>
                </Link>
              </div>

              <input type="hidden" name="id" value={postData.id} />
            </form>
          </Form>
    )
}