"use client"

import { ChangePasswordCommand, passwordChangeSchema } from "@/entities/user"
import { useChangePassword } from "../model/useChangePassword"
import { Button } from "@/shared/shadcn/ui/button"
import { Card } from "@/shared/shadcn/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/shadcn/ui/form"
import { Input } from "@/shared/shadcn/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"



export function PasswordChangeForm() {
  const form = useForm<ChangePasswordCommand>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  })

  const { mutate: updatePasswordMutation, isPending } = useChangePassword((field, message) => {
        form.setError(field as keyof ChangePasswordCommand, {
            type: 'server',
            message,
        })
    })

  async function onSubmit(values: ChangePasswordCommand) {
    updatePasswordMutation(values)
  }

  return (

    <Card className="bg-paper border-2 border-ink/15 shadow-soft p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" >
          {/* 현재 비밀번호 필드 */}
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-ink font-semibold">현재 비밀번호</FormLabel>
                <FormControl>
                  <Input
                    placeholder="현재 비밀번호를 입력해주세요"
                    type="password"
                    className="border-2 border-ink/15 bg-paper text-ink placeholder-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 새 비밀번호 필드 */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-ink font-semibold">새 비밀번호</FormLabel>
                <FormControl>
                  <Input
                    placeholder="새 비밀번호를 입력해주세요 (최소 6자)"
                    type="password"
                    className="border-2 border-ink/15 bg-paper text-ink placeholder-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 새 비밀번호 확인 필드 */}
          <FormField
            control={form.control}
            name="newPasswordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-ink font-semibold">새 비밀번호 확인</FormLabel>
                <FormControl>
                  <Input
                    placeholder="새 비밀번호를 다시 입력해주세요"
                    type="password"
                    className="border-2 border-ink/15 bg-paper text-ink placeholder-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 안내 메시지 */}
          <div className="p-4 bg-ink/5 rounded-lg border-2 border-ink/15">
            <p className="text-sm text-ink">
              <strong>비밀번호 보안 팁:</strong>
            </p>
            <ul className="mt-2 text-xs text-ink-soft space-y-1 list-disc list-inside">
              <li>최소 6자 이상의 비밀번호를 사용하세요</li>
              <li>영문, 숫자, 특수문자를 조합하면 더 안전합니다</li>
              <li>다른 사이트와 동일한 비밀번호를 사용하지 마세요</li>
            </ul>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-ink text-paper hover:bg-ink/90 active:scale-[0.97]"
              disabled={isPending}
            >
              {isPending ? "변경 중..." : "비밀번호 변경"}
            </Button>
            <Link href="/profile" className="flex-1">
              <Button type="button" variant="outline" className="w-full border-2 border-ink/20 bg-transparent text-ink hover:bg-ink/5 hover:text-ink" disabled={isPending}>
                취소
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </Card>
  )
}
