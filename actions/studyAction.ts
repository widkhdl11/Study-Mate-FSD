'use server'

import {
    CreateStudyCommand,
    studyCreateSchema,
} from '@/entities/study'
import { parseFormData } from '@/shared/lib/parseFormData'
import { buildStudyInsert } from '@/entities/study/lib/buildStudyInsert'
import { createClient } from '@/shared/api/supabase/server'
import type { ActionResponse } from '@/shared/kernel/actionType'
import { CustomUserAuth } from '@/shared/lib/auth'
import { validateWithZod } from '@/shared/lib/validation'
import { revalidatePath } from 'next/cache'
import { notFound, redirect } from 'next/navigation'

// 로그인 유저가 스터디 생성
export async function createStudy(formData: FormData): Promise<ActionResponse> {
    const supabase = await createClient()

    const { user } = await CustomUserAuth(supabase)
    const rawData = parseFormData(formData)
    const parseResult = validateWithZod(studyCreateSchema, rawData)
    if (parseResult.success === false) {
        return parseResult
    }

    const validatedData = parseResult.data as CreateStudyCommand
    const insertData = buildStudyInsert(validatedData, user.id)
    const { error } = await supabase.from('studies').insert(insertData).select().single()

    if (error) {
        throw new Error('스터디 생성에 실패했습니다.')
    }

    revalidatePath('/posts', 'layout')
    redirect('/posts')
}

// 나의 참여 스터디 목록 조회
export async function getMyStudies(): Promise<ActionResponse> {
    const supabase = await createClient()

    const { user } = await CustomUserAuth(supabase)
    const { data, error } = await supabase
        .from('participants')
        .select('*, studies!participants_study_id_fkey(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error('참여 스터디 목록 조회에 실패했습니다.')
    }

    return { success: true, data }
}

// 내가 생성한 스터디 목록 조회
export async function getMyCreatedStudies(): Promise<ActionResponse> {
    const supabase = await createClient()

    const { user } = await CustomUserAuth(supabase)
    const { data, error } = await supabase
        .from('studies')
        .select('*')
        .eq('creator_id', user.id)
    if (error) {
        throw new Error('생성한 스터디 목록 조회에 실패했습니다.')
    }
    return { success: true, data }
}

// // 스터디 상태 변경
// export async function setStudyStatus(id: number, status: string) {

//   const supabase = await createClient();
//   const { data, error } = await supabase
//     .from("studies")
//     .update({ status })
//     .eq("id", id);

//   if (error) {
//     return { success: false, error: { message: error.message } };
//   }
//   return { success: true, data };
// }

// // 스터디 상세 조회
// export async function getStudyById(id: string): Promise<ActionResponse> {
//   const supabase = await createClient();
//   const { data, error } = await supabase
//     .from("studies")
//     .select("*")
//     .eq("id", id)
//     .single();
//   if (error) {
//     return { success: false, error: { message: error.message } };
//   }
//   return { success: true, data };
// }

// 스터디 상세 조회
export async function getStudyDetail(
    id: number
): Promise<ActionResponse<StudiesResponse>> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('studies')
        .select(
            `
      *,
      creator:profiles!studies_creator_id_fkey (
        id,
        username,
        email,
        avatar_url
      ),
      participants!participants_study_id_fkey (
        id,
        user_id,
        username,
        user_email,
        study_id,
        role,
        status,
        avatar_url
      ),
      posts!posts_study_id_fkey (
        id,
        title,
        study_id,
        content,
        image_url,
        likes_count,
        views_count,
        created_at,
        updated_at
      )
      `
        )
        .eq('id', id)
        .single()

    // participants를 id 오름차순으로 정렬
    if (data && data.participants && Array.isArray(data.participants)) {
        data.participants.sort((a: any, b: any) => a.id - b.id)
    }

    if (error) {
        throw new Error('스터디 상세 조회에 실패했습니다.')
    }
    return { success: true, data }
}

export async function deleteStudy(id: string) {
    const supabase = await createClient()

    const { user } = await CustomUserAuth(supabase)
    const { data, error } = await supabase
        .from('studies')
        .delete()
        .eq('id', id)
        .eq('creator_id', user.id)

    const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .delete()
        .eq('study_id', id)
        .eq('user_id', user.id)

    if (error || participantsError) {
        throw new Error('스터디 삭제에 실패했습니다.')
    }
    revalidatePath('/studies', 'layout')
    revalidatePath('/profile', 'layout')
    redirect('/profile?tab=studies')
}

export async function updateStudy(formData: FormData): Promise<ActionResponse> {
    const supabase = await createClient()
    // const rawData = {
    //     id: formData.get('id') as string,
    //     title: formData.get('title') as string,
    //     mainCategory: formData.get('mainCategory') as string,
    //     subCategory: formData.get('subCategory') as string,
    //     detailCategory: formData.get('detailCategory') as string,
    //     studyCategory: Number(formData.get('studyCategory')) as number,
    //     mainRegion: formData.get('mainRegion') as string,
    //     detailRegion: formData.get('detailRegion') as string,
    //     region: Number(formData.get('region')) as number,
    //     maxParticipants: Number(formData.get('maxParticipants')) as number,
    //     description: formData.get('description') as string,
    // }
    const { user } = await CustomUserAuth(supabase)
    const rawData = parseFormData(formData)
    const parseResult = validateWithZod(studySchema, rawData)
    if (!parseResult.success) {
        return parseResult
    }
    const { id, title, studyCategory, region, maxParticipants, description } =
        parseResult.data as StudyFormValues

    const { data, error } = await supabase
        .from('studies')
        .update({
            title,
            study_category: studyCategory,
            region,
            max_participants: maxParticipants,
            description,
        })
        .eq('id', id)
        .eq('creator_id', user.id)
        .select()
        .single()

    const {
        error: participantsError,
        count: participantsCount,
    } = await supabase
        .from('participants')
        .select('*', { count: 'exact' })
        .eq('study_id', id)
        .eq('status', 'accepted')

    if (participantsError || participantsCount === null) {
        throw new Error('참여자 수정에 실패했습니다')
    }

    if (participantsCount > maxParticipants) {
        return {
            success: false,
            error: {
                message: '참여자 수가 최대 인원을 초과합니다',
                field: 'maxParticipants',
            },
        }
    }

    if (error) {
        throw new Error('스터디 수정에 실패했습니다')
    }

    if (!data || data.length === 0) {
        throw new Error('스터디를 찾을 수 없거나 권한이 없습니다')
    }

    revalidatePath('/profile', 'layout')
    redirect('/studies/' + id)
}

// ================ssr===============
// 내가 생성한 스터디 조회
export async function getMyCreatedStudiesSSR(): Promise<StudiesResponse> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    const { data, error } = await supabase
        .from('studies')
        .select('*')
        .eq('creator_id', user.id)
        
    // 3. 없거나 권한 없으면
    if (error) {
        notFound()
    }
    if (!data || data.length === 0) {
        return []
    }
    return data as unknown as StudiesResponse
}

// 참여중인 스터디
export async function getMyStudiesSSR(): Promise<StudiesResponse> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    const { data, error } = await supabase
        .from('participants')
        .select('*, studies!participants_study_id_fkey(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    if (error) {
        notFound()
    }
    return data as unknown as StudiesResponse
}

