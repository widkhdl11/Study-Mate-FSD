import { err, ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";
import { StudyDeleteIntent, Study, StudyFromRowError, StudyInsert, StudyRow } from "../model/Study";
import { StudyId } from "../model/StudyId";

export type StudyRepositoryError =
  | { readonly kind: "NotFound";  readonly id: StudyId }
  | { readonly kind: "Infra";     readonly message: string }
  | { readonly kind: "Mapping";   readonly cause: StudyFromRowError }


  export async function findStudyById(  
    supabase: SupabaseClient,
    id: StudyId
): Promise<Result<Study, StudyRepositoryError>> {


    const {data , error} = await supabase
    .from("studies")
    .select("*")
    .eq("id",id)
    .single();

     
    if (error) {
        if (error.code === "PGRST116") {
        return err({ kind: "NotFound", id });
        }
    return err({ kind: "Infra", message: error.message });
    }

    const studyResult = Study.fromRow(data)
    if (!studyResult.ok){
        return err({kind : "Mapping", cause : studyResult.error})
    }
    return studyResult

}

export async function findAllStudies(supabase: SupabaseClient): Promise<Result<readonly Study[], StudyRepositoryError>>{

    const { data, error } = await supabase
    .from("studies")
    .select("*")


    if (error) {
        return err({ kind: "Infra", message: error.message });
    }

    const studies:Study[] = []

    for (const row of data){
        const result = Study.fromRow(row)

        if (!result.ok){
            return err({kind : "Mapping", cause : result.error})
        }
        studies.push(result.value)
    }
    return ok(studies)
}

export async function updateStudy(supabase: SupabaseClient, study:Study, _originalUpdatedAt: string) : Promise<Result<Study, StudyRepositoryError>> {
    const studyRow = Study.toUpdateRow(study)
    
    
    const { data, error } = await supabase
    .from("studies")
    .update({...studyRow, updated_at : new Date().toISOString()})
    .eq("id",study.id)
    // .eq("current_participants",study.capacity.current)
    .select()
    .single();
    
    if (error) {
        if (error.code === "PGRST116") {
            return err({ kind: "NotFound", id: study.id });
        }
            return err({ kind: "Infra", message: error.message });
    }

    const result = Study.fromRow(data as StudyRow);

    if (!result.ok) {
        return err({ kind: "Mapping", cause: result.error });
    }

    return result;

}

export async function deleteStudy(supabase : SupabaseClient, deleteStudyIntent: StudyDeleteIntent) : Promise<Result<void,StudyRepositoryError>> {

    const { error } = await supabase
    .from("studies")
    .delete()
    .eq("id",deleteStudyIntent.studyId)
    
    if (error) {
        return err({ kind: "Infra", message: error.message });
    }

    return ok(undefined)
}

export async function insertStudy(supabase: SupabaseClient, studyInsert: StudyInsert) : Promise<Result<Study,StudyRepositoryError>> {
    
    const studyInsertRow = Study.toInsertRow(studyInsert)

    const { data, error } = await supabase
    .from("studies")
    .insert(studyInsertRow)
    .select()
    .single()

    if (error) {
        return err({ kind: "Infra", message: error.message });
    }

    const result = Study.fromRow(data as StudyRow);
    if (!result.ok) {
        return err({ kind: "Mapping", cause: result.error });
    }
    return result
}


// 스터디 생성 프로시저 호출(스터디 생성시 chat과 chat_participants, 참여자테이블에 자동으로 추가)
export async function createStudyWithHost(
  supabase: SupabaseClient,
  studyInsert: StudyInsert
): Promise<Result<Study, StudyRepositoryError>> {
  const row = Study.toInsertRow(studyInsert);
  const { data, error } = await supabase.rpc('create_study_with_host', {
    p_creator_id:       row.creator_id,
    p_title:            row.title,
    p_description:      row.description,
    p_region:           row.region,
    p_study_category:   row.study_category,
    p_max_participants: row.max_participants,
  });
  if (error) return err({ kind: 'Infra', message: error.message });
  const result = Study.fromRow(data as StudyRow);
  if (!result.ok) return err({ kind: 'Mapping', cause: result.error });
  return result;
}
