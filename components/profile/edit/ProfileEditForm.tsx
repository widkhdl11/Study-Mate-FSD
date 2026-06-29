"use client"

import profileEditSchema, { UpdateProfileCommand } from "@/entities/user/model/profileFormSchema"
import { ProfileResponse } from "@/entities/user/model/types"
import { useUpdateProfile } from "@/hooks/useProfile"
import { Button } from "@/shared/shadcn/ui/button"
import { Card } from "@/shared/shadcn/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/shadcn/ui/form"
import { Input } from "@/shared/shadcn/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select"
import { Textarea } from "@/shared/shadcn/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRef } from "react"
import { useForm } from "react-hook-form"



export function ProfileEditForm({ useData }: { useData: ProfileResponse }) {
  const { mutate: updateProfileMutation, isPending } = useUpdateProfile()
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<UpdateProfileCommand>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      username: useData.username || "",
      email: useData.email || "",
      bio: useData.bio || "",
      birthDate: useData.birthDate || "",
      gender: useData.gender || "",
    },
  })

  async function onSubmit(values: UpdateProfileCommand) {
    if (!formRef.current) {
      return;
    }
      const formData = new FormData(formRef.current);
      // TODO: 실제 프로필 수정 API 호출
      updateProfileMutation(formData);
    
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4 gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              프로필로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mx-2">프로필 수정</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 mx-4">회원 정보를 수정할 수 있습니다</p>
        </div>

        {/* 프로필 수정 폼 카드 */}
        <Card className="p-6">
          <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 사용자명 필드 */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>아이디</FormLabel>
                    <FormControl>
                      <Input placeholder="이름을 입력해주세요" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 이메일 필드 */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input placeholder="example@email.com" type="email" disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 소개 필드 */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>간단 소개</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="자기소개를 입력해주세요"
                        disabled={isPending}
                        rows={4}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 생년월일 필드 */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>생년월일</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isPending} {...field} className="w-36 mw-auto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 성별 필드 */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>성별</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="성별을 선택해주세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">남성</SelectItem>
                        <SelectItem value="female">여성</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 버튼 그룹 */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isPending}
                >
                  {isPending ? "수정 중..." : "수정하기"}
                </Button>
                <Link href="/profile" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent" disabled={isPending}>
                    취소
                  </Button>
                </Link>
              </div>
              <input type="hidden" name="birthDate" value={form.getValues("birthDate")} />
              <input type="hidden" name="gender" value={form.getValues("gender")} />
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}
