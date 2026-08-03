
import { LoginCommand, loginSchema } from "@/entities/user";
import { Button } from "@/shared/shadcn/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/shadcn/ui/form";
import { Input } from "@/shared/shadcn/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useLogin } from "../model/useLogin";

export default function LoginForm() {
    const formRef = useRef<HTMLFormElement>(null)
    const form = useForm<LoginCommand>({
        resolver: zodResolver(loginSchema),
        mode: 'onTouched',
        defaultValues: {
            email: '',
            password: '',
        },
    })
    const loginMutation = useLogin((field, message) => {
        form.setError(field as keyof LoginCommand, {
            type: 'server',
            message,
        })
    })

    async function onSubmit(values: LoginCommand) {
        loginMutation.mutate(values)
    }
    return (
        <Form {...form}>
            <form
                ref={formRef}
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'>
                {/* 이메일 필드 */}
                <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>이메일</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder='example@email.com'
                                    type='email'
                                    disabled={
                                        loginMutation.isPending
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 비밀번호 필드 */}
                <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>비밀번호</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder='비밀번호를 입력해주세요'
                                    type='password'
                                    disabled={
                                        loginMutation.isPending
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 로그인 버튼 */}
                <Button
                    type='submit'
                    className='mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground'
                    disabled={loginMutation.isPending}>
                    {loginMutation.isPending
                        ? '로그인 중...'
                        : '로그인'}
                </Button>
            </form>

        </Form>
    )
}