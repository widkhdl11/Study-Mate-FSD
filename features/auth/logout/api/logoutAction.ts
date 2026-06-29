'use server'

import { createClient } from "@/shared/api/supabase/server";
import { ActionResponse } from "@/shared/kernel/actionType";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

 export async function logoutAction(): Promise<ActionResponse > {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error("로그아웃에 실패했습니다.");
    }

    revalidatePath("/", "layout");
    redirect("/");
  }