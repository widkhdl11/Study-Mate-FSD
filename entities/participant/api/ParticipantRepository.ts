import { StudyId } from "@/entities/study/model/StudyId";
import { UserId } from "@/entities/user/model/UserId";
import { err, ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";
import { DeleteParticipantIntent, Participant, ParticipantFromRowError, ParticipantInsert, ParticipantRow } from "../model/Participant";
import { ParticipantId } from "../model/ParticipantId";

export type ParticipantRepositoryError =
| { readonly kind : "NotFound", readonly id : ParticipantId }
| { readonly kind : "Infra", readonly message : string }
| { readonly kind : "Mapping", readonly cause : ParticipantFromRowError }

export async function findParticipantById(supabase: SupabaseClient, participantId:ParticipantId) : Promise<Result<Participant, ParticipantRepositoryError>>{

    // id로 조회
    // 받은 값 Study 객체로 반환
    const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("id", participantId)
    .single()

    if (error){
        if ( error.code === "PGRST116")
            return err({ kind :"NotFound", id : participantId})
        return err({kind : "Infra", message : error.message})
    }

    const participantResult = Participant.fromRow(data)

    if ( !participantResult.ok){
        return err({ kind : "Mapping", cause : participantResult.error })
    }

    return participantResult
}

// 해당 스터디의 참여자 정보 조회
export async function findParticipantByStudyAndUser(
    supabase: SupabaseClient,
    studyId: StudyId,
    userId: UserId
): Promise<Result<Participant | null, ParticipantRepositoryError>> {
    const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("study_id", studyId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        return err({ kind: "Infra", message: error.message });
    }

    if (!data) {
        return ok(null);
    }

    const participantResult = Participant.fromRow(data);
    if (!participantResult.ok) {
        return err({ kind: "Mapping", cause: participantResult.error });
    }

    return participantResult;
}

// 해당 스터디의 모든 참여자 찾기
export async function findParticipantsByStudyId(supabase: SupabaseClient, studyId : StudyId) : Promise<Result<readonly Participant[], ParticipantRepositoryError>> {
    const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("study_id", studyId)

    if (error){
        return err({kind : "Infra", message : error.message})
    }

    const participantsResult:Participant[] = []

    for (const row of data){
        const result = Participant.fromRow(row)

        if ( !result.ok){
            return err({ kind :"Mapping", cause : result.error})
        }
        participantsResult.push(result.value)
    }

    return ok(participantsResult)
}

export async function upsertParticipant(
    supabase: SupabaseClient,
    participant: Participant | ParticipantInsert,
): Promise<Result<Participant, ParticipantRepositoryError>> {
    // const participantRow = Participant.toRow(participant)
    const participantRow = 'id' in participant ? Participant.toRow(participant) : Participant.toInsertRow(participant);
    const { data, error } = await supabase
    .from("participants")
    .upsert(participantRow, { onConflict: "study_id,user_id" })
    .select()
    .single();

    if ( error ){
        return err({ kind: "Infra", message: error.message });
    }

    const result = Participant.fromRow(data as ParticipantRow)

    if (!result.ok){
        return err({kind:"Mapping", cause : result.error})
    }
    return result;
}

export async function updateParticipant(
    supabase: SupabaseClient,
    participant: Participant,
): Promise<Result<Participant, ParticipantRepositoryError>> {
    const participantRow = Participant.toRow(participant)

    const { data, error } = await supabase
    .from("participants")
    .update({...participantRow, updated_at: new Date().toISOString()})
    .eq("id", participantRow.id)
    .select()
    .single();

    if ( error ){
         if (error.code === "PGRST116") {
            return err({ kind: "NotFound", id: participant.id });
        }
        return err({ kind: "Infra", message: error.message });
    }

    const result = Participant.fromRow(data as ParticipantRow)

    if (!result.ok){
        return err({kind:"Mapping", cause : result.error})
    }
    return result;
}

// 참여자 삭제
export async function deleteParticipant(
    supabase: SupabaseClient,
    deleteParticipantIntent: DeleteParticipantIntent
): Promise<Result<void, ParticipantRepositoryError>> {

    // 아이디로 삭제
    // 반환

    const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", deleteParticipantIntent.participantId)


    if (error){
        return err({kind : "Infra", message : error.message})
    }

    return ok(undefined)
}

// 참여자 추가
export async function insertParticipant(supabase: SupabaseClient, participantInsert : ParticipantInsert ): Promise<Result<Participant, ParticipantRepositoryError>> {
    // insert VO를 받아서 ROW로 변경
    // 쿼리 실행
    // 결과를 Participant VO로 변경 
    // 반환

    const participantInsertRow = Participant.toInsertRow(participantInsert)

    const { data, error } = await supabase
    .from("participants")
    .insert(participantInsertRow)
    .select()
    .single()

    if (error) {
        return err({ kind: "Infra", message: error.message });
    }

    const result = Participant.fromRow(data as ParticipantRow)
      if (!result.ok) {
        return err({ kind: "Mapping", cause: result.error });
    }
    return result
}