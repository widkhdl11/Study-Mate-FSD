"use server";

import { PostsRecommendedResponse } from "@/entities/post/model/types";
import { StudyRecommendationView } from "@/entities/study/model/types";
import { createClient } from "@/shared/api/supabase/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// interface RecommendedStudy {
//   studyId: number;
//   title: string;
//   reason: string;
// }

export async function getAIRecommendedStudies() {
  const supabase = await createClient();

  // 1, 2번 — DB 조회 부분은 OpenAI 버전과 완전히 동일
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: { message: "로그인이 필요합니다" } };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio")
    .eq("id", user.id)
    .single();

  const { data: studies } = await supabase
    .from("studies")
    .select(`
      id, title, description, study_category, region,
      max_participants, current_participants
    `)
    .eq("status", "recruiting")
    .neq("creator_id", user.id)
    .limit(20);

  if (!studies || studies.length === 0) {
    return { success: false, error: { message: "추천할 스터디가 없습니다" } };
  }

  // 3. Gemini 호출 — 여기가 다른 부분
  const prompt = `
당신은 스터디 매칭 전문가입니다.

## 사용자 정보
- 이름: ${profile?.username || "사용자"}
- 자기소개: ${profile?.bio || "정보 없음"}

## 모집 중인 스터디 목록
${studies.map((s, i) => `
${i + 1}. [ID: ${s.id}] ${s.title}
   - 카테고리: ${s.study_category}
   - 지역: ${s.region}
   - 설명: ${s.description}
   - 인원: ${s.current_participants}/${s.max_participants}명
`).join("")}

## 요청
위 스터디 중 사용자에게 가장 적합한 3개를 추천해주세요.
JSON 배열로만 응답하세요. 다른 텍스트 없이.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",  // ← JSON 강제
        temperature: 0.7,
      },
    });

    console.log('response', response)
    console.log('response.text', response.text)
    const content = response.text;
    if (!content) {
      return { success: false, error: { message: "AI 응답이 없습니다" } };
    }

    // const recommendations: RecommendedStudy[] = JSON.parse(content);
    const recommendationsStudies: StudyRecommendationView[] = JSON.parse(content);
    // console.log('recommendations', recommendations)

    // 4, 5번 — DB 재조회 + 합치기 부분도 OpenAI 버전과 완전히 동일
    const recommendedStudyIds = recommendationsStudies.map((r) => r.id);
    const { data: recommendedStudies } = await supabase
      .from("studies")
      .select(`*, profiles:creator_id (username, avatar_url)`)
      .in("id", recommendedStudyIds);

    const result = recommendationsStudies.map((rec) => ({
      ...rec,
      study: recommendedStudies?.find((s) => s.id === rec.id),
    }));

    return { success: true, data: result };
  } catch (error: unknown) {
    return {
      success: false,
      error: { message: "AI 추천 중 오류가 발생했습니다" },
    };
  }
}

export async function getAIRecommendedPosts() {
  const supabase = await createClient();

  // 1, 2번 — DB 조회 부분은 OpenAI 버전과 완전히 동일
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: { message: "로그인이 필요합니다" } };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio")
    .eq("id", user.id)
    .single();

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      study:posts_study_id_fkey (
        id,
        title,
        description,
        study_category,
        region,
        max_participants,
        current_participants,
        status
      ),
      author:posts_author_id_fkey (
        id,
        username,
        email,
        avatar_url
      )
    `)
    .neq("author_id", user.id)
    .eq("study.status", "recruiting")
    .not("study", "is", null)
    .limit(4);

  if (!posts || posts.length === 0) {
    return { success: false, error: { message: "추천할 스터디가 없습니다" } };
  }

  // 3. Gemini 호출 — 여기가 다른 부분
  const prompt = `
당신은 스터디 매칭 전문가입니다.

## 사용자 정보
- 이름: ${profile?.username || "사용자"}
- 자기소개: ${profile?.bio || "정보 없음"}

## 모집 중인 게시글 목록
${posts.map((p, i) => `
${i + 1}. [ID: ${p.id}] ${p.title}
   - 제목: ${p.title}
   - 내용: ${p.content}
   - 이미지: ${p.image_url}
   - 스터디: ${p.study?.title}
   - 스터디 카테고리: ${p.study?.study_category}
   - 스터디 지역: ${p.study?.region}
   - 스터디 인원: ${p.study?.current_participants}/${p.study?.max_participants}명
   - 스터디 상태: ${p.study?.status}
   - 작성자: ${p.author?.username}
   - 작성자 이미지: ${p.author?.avatar_url}
`).join("")}


## 요청
위 게시글 중 사용자에게 가장 적합한 4개를 추천해주세요.
JSON 배열로만 응답하세요. 다른 텍스트 없이.
반환 형식:
[
  {
    "id": 숫자,
    "title": "게시글 제목",
    "content": "게시글 내용",
    "image_url": [
      {
        "id": 숫자,
        "url": "게시글 이미지 URL",
        "originalName": "게시글 이미지 원본 이름",
        "size": 숫자
      }
    ],
    "study": {
      "id": 숫자,
      "title": "스터디 제목"
      "description": "스터디 설명",
      "study_category": "스터디 카테고리",
      "region": "스터디 지역",
      "max_participants": 숫자,
      "current_participants": 숫자,
      "status": "스터디 상태"
    },
    "author": {
      "id": 숫자,
      "username": "작성자 이름",
      "avatar_url": "작성자 이미지 URL"
    }
  }
]
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",  // ← JSON 강제
        temperature: 0.7,
      },
    });

    const content = response.text;
    if (!content) {
      return { success: false, error: { message: "AI 응답이 없습니다" } };
    }

    const result: PostsRecommendedResponse[] = JSON.parse(content);

    // 4, 5번 — DB 재조회 + 합치기 부분도 OpenAI 버전과 완전히 동일

    return { success: true, data: result };
  } catch (error: unknown) {
    return {
      success: false,
      error: { message: "AI 추천 중 오류가 발생했습니다" },
    };
  }
}