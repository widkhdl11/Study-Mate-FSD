'use server'

import { ChangePasswordCommand, passwordChangeSchema } from "@/entities/user";
import { createClient } from "@/shared/api/supabase/server";
import { ActionResponse } from "@/shared/kernel/actionType";
import { CustomUserAuth } from "@/shared/lib/auth";
import { validate } from "@/shared/lib/validate";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
  
export async function changePasswordAction(ChangePasswordCommand: ChangePasswordCommand): Promise<ActionResponse> {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);

  const parseResult = validate(passwordChangeSchema, ChangePasswordCommand);
  if (!parseResult.ok) {
    return { success: false, error: parseResult.error };
  }
  
  const { currentPassword, newPassword } = parseResult.value;
  
  // 1) 현재 비밀번호 검증 — 재로그인 시도로 확인
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (verifyError) {
    return { success: false, error: { message: "현재 비밀번호가 일치하지 않습니다.", field: "currentPassword" } }
  }

  // 2) 새 비밀번호로 변경 (password만 — current_password 안 씀)
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    return { success: false, error: { message: "비밀번호 변경에 실패했습니다." } }
  }

  revalidatePath("/", "layout");
  redirect("/");
}