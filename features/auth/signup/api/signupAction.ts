'use server'

import { SignupCommand, signupSchema } from "@/entities/user";
import { createClientAdmin } from "@/shared/api/supabase/client-admin";
import { createClient } from "@/shared/api/supabase/server";
import { ActionResponse } from "@/shared/kernel/actionType";
import { validate } from "@/shared/lib/validate";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signupAction(signupForm: SignupCommand): Promise<ActionResponse> {
    const supabase = await createClient();
    const supabaseAdmin = createClientAdmin();
   
    const parseResult = validate(signupSchema, signupForm);
    if (!parseResult.ok) {
      return {
        success: false,
        error: { message: parseResult.error.message, field: parseResult.error.field },
      };
    }

    const { username, email, password, birthDate, gender } = parseResult.value;

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      let message = "회원가입에 실패했습니다.";

      if (authError.message.includes("already registered")) {
        message = "이미 가입된 이메일입니다.";
      } else if (authError.message.includes("Password")) {
        message = "비밀번호가 보안 요구사항을 충족하지 않습니다.";
      }

      return {
        success: false,
        error: { message, field: "email" },
      };
    }

    if (!data.user) {
      throw new Error("회원가입에 실패했습니다.");
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email,
      username: username,
      birth_date: birthDate,
      gender: gender,
    });


    // 프로필 생성 실패 → auth 테이블 유저 삭제
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      if (profileError.code === "23505") {
        return {
          success: false,
          error: { message: "이미 가입된 아이디입니다.", field: "username" },
        };
      }
      throw new Error("회원가입에 실패했습니다. 다시 시도해주세요.");
    }

    revalidatePath("/", "layout");
    redirect("/");
  }