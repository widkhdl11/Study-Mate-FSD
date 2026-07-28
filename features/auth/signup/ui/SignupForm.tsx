import { SignupCommand, signupSchema } from "@/entities/user";
import { zodResolverFirstError } from "@/shared/lib/validation";
import { Button } from "@/shared/shadcn/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/shadcn/ui/form";
import { Input } from "@/shared/shadcn/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useSignup } from "../model/useSignup";

export default function SignupForm() {
    const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<SignupCommand>({
    resolver: zodResolverFirstError(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
      birthDate: "",
      gender: undefined,
    },
  });
  const signupMutation = useSignup((field, message) => {
    form.setError(field as keyof SignupCommand, {
      type: "server",
      message,
    });
  });

  async function onSubmit(values: SignupCommand) {
    signupMutation.mutate(values);
  }
    return (
         <Form {...form}>
            <form
              ref={formRef}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* 사용자명 필드 */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>아이디</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="아이디를 입력해주세요"
                        disabled={signupMutation.isPending}
                        {...field}
                      />
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
                      <Input
                        placeholder="example@email.com"
                        type="email"
                        disabled={signupMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 비밀번호 필드 */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="비밀번호를 입력해주세요"
                        type="password"
                        disabled={signupMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 비밀번호 확인 필드 */}
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="비밀번호를 다시 입력해주세요"
                        type="password"
                        disabled={signupMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                name="birthDate"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>생년월일</FormLabel>
                    <input 
                      type="hidden" 
                      name="birthDate" 
                      value={field.value ?? ""} 
                    />
                    <FormControl>
                     
                      <Input 
                        type="date"
                        disabled={signupMutation.isPending} 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>성별</FormLabel>
                    <Select onValueChange={field.onChange} 
                      defaultValue={field.value || ""} 
                      disabled={signupMutation.isPending}>
                      <input type="hidden" name="gender" value={field.value ?? ""} />
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

              {/* 회원가입 버튼 */}
              <Button
                type="submit"
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "회원가입 중..." : "회원가입"}
              </Button>
              
            </form>
          </Form>
    )
}