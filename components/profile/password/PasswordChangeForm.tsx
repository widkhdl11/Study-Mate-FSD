"use client"

import { ChangePasswordCommand, passwordChangeSchema } from "@/entities/user/model/authFormSchema"
import { useChangePassword } from "@/features/auth/change-password/model/useChangePassword"
import { Button } from "@/shared/shadcn/ui/button"
import { Card } from "@/shared/shadcn/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/shadcn/ui/form"
import { Input } from "@/shared/shadcn/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Lock } from "lucide-react"
import Link from "next/link"
import { useRef } from "react"
import { useForm } from "react-hook-form"



export function PasswordChangeForm() {
  const formRef = useRef<HTMLFormElement>(null)


  const { mutate: updatePasswordMutation, isPending } = useChangePassword((field, message) => {
        form.setError(field as keyof ChangePasswordCommand, {
            type: 'server',
            message,
        })
    })

  const form = useForm<ChangePasswordCommand>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  })

  async function onSubmit(values: ChangePasswordCommand) {
    updatePasswordMutation(values)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4 gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              프로필로 돌아가기
            </Button>
          </Link>
          <div className="flex items-center gap-3 mx-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">비밀번호 변경</h1>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 mx-4">
            보안을 위해 정기적으로 비밀번호를 변경해주세요
          </p>
        </div>

        {/* 비밀번호 변경 폼 카드 */}
        <Card className="p-6">
          <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" >
              {/* 현재 비밀번호 필드 */}
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>현재 비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="현재 비밀번호를 입력해주세요"
                        type="password"
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
                    <FormLabel>새 비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="새 비밀번호를 입력해주세요 (최소 6자)"
                        type="password"
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
                    <FormLabel>새 비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="새 비밀번호를 다시 입력해주세요"
                        type="password"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 안내 메시지 */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>비밀번호 보안 팁:</strong>
                </p>
                <ul className="mt-2 text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>최소 6자 이상의 비밀번호를 사용하세요</li>
                  <li>영문, 숫자, 특수문자를 조합하면 더 안전합니다</li>
                  <li>다른 사이트와 동일한 비밀번호를 사용하지 마세요</li>
                </ul>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isPending}
                >
                  {isPending ? "변경 중..." : "비밀번호 변경"}
                </Button>
                <Link href="/profile" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent" disabled={isPending}>
                    취소
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}
