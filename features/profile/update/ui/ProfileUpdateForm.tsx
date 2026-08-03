"use client"

import { profileEditSchema, ProfileResponse, UpdateProfileCommand } from "@/entities/user"
import { Button } from "@/shared/shadcn/ui/button"
import { Card } from "@/shared/shadcn/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/shadcn/ui/form"
import { Input } from "@/shared/shadcn/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select"
import { Textarea } from "@/shared/shadcn/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { type BaseSyntheticEvent } from "react"
import { useForm } from "react-hook-form"
import { useUpdateProfile } from "../model/useUpdateProfile"



export function ProfileUpdateForm({ useData }: { useData: ProfileResponse }) {
  const { mutate: updateProfileMutation, isPending } = useUpdateProfile()

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

  async function onSubmit(_data: UpdateProfileCommand, event?: BaseSyntheticEvent) {
    const formEl = event?.target as HTMLFormElement | undefined;
    if (!formEl) return;
    const formData = new FormData(formEl);
    // TODO: 실제 프로필 수정 API 호출
    updateProfileMutation(formData);
  }

  return (
    /* 프로필 수정 폼 카드 */
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
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
  
  )
}
