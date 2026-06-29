'use server'

import { LoginCommand, loginSchema } from "@/entities/user";
import { createClient } from "@/shared/api/supabase/server";
import { ActionResponse } from "@/shared/kernel/actionType";
import { validate } from "@/shared/lib/validate";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(loginFormValues: LoginCommand): Promise<ActionResponse> {
  const supabase = await createClient();
  const parseResult = validate(loginSchema, loginFormValues);
  if (!parseResult.ok) {
    return { success: false, error: parseResult.error };
  }
  const { email, password } = parseResult.value;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    // 400 = 사용자 입력 문제
    if (error.status === 400) {
      return {
        success: false,
        error: { message: "이메일 또는 비밀번호가 일치하지 않습니다.", field: "email" },
      };
    }
    return { success: false, error: { message: "로그인에 실패했습니다." } };
  }
    revalidatePath("/", "layout");
    redirect("/");
}