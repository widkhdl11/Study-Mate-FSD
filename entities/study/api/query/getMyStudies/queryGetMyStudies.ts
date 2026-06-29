'use server'


import { StudyFromRowError } from "@/entities/study/model/Study";
import { StudyResponse } from "@/entities/study/model/types";
import { createClient } from "@/shared/api/supabase/server";
import { err, ok, Result } from "@/shared/kernel/Result";
import { CustomUserAuth } from "@/shared/lib/auth";
import { toGetMyStudiesView } from "./toView";

export type QueryGetMyStudiesError =
| { readonly kind: "Mapping"; readonly cause: StudyFromRowError }
| { readonly kind: "Infra"; readonly message: string }
| { readonly kind: "InvalidData"; readonly message: string };

export async function queryGetMyStudies(): Promise<Result<StudyResponse[], QueryGetMyStudiesError>> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    const { data, error } = await supabase
    .from('studies')
    .select('*')
    .eq('creator_id', user.id)


    
    if (error) {
        return err({ kind: "Infra", message: error.message });
    }
    return ok(toGetMyStudiesView(data ?? []));
}