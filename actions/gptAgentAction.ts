// actions/ai.ts
"use server";

import { createClient } from "@/shared/api/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RecommendedStudy {
  studyId: number;
  title: string;
  reason: string;
}

// gpt
export async function getAIRecommendedStudies() {
  const supabase = await createClient();

  // 1. 현재 사용자 정보
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: { message: "로그인이 필요합니다" } };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio")
    .eq("id", user.id)
    .single();

  // 2. 모집 중인 스터디 목록
  const { data: studies } = await supabase
    .from("studies")
    .select(
      `
      id,
      title,
      description,
      study_category,
      region,
      max_participants,
      current_participants
    `,
    )
    .eq("status", "recruiting")
    .neq("creator_id", user.id)
    .limit(20);

  if (!studies || studies.length === 0) {
    return { success: false, error: { message: "추천할 스터디가 없습니다" } };
  }

  // 3. OpenAI에 추천 요청
  const prompt = `
당신은 스터디 매칭 전문가입니다.

## 사용자 정보
- 이름: ${profile?.username || "사용자"}
- 자기소개: ${profile?.bio || "정보 없음"}

## 모집 중인 스터디 목록
${studies
  .map(
    (s, i) => `
${i + 1}. [ID: ${s.id}] ${s.title}
   - 카테고리: ${s.study_category}
   - 지역: ${s.region}
   - 설명: ${s.description}
   - 인원: ${s.current_participants}/${s.max_participants}명
`,
  )
  .join("")}

## 요청
위 스터디 중에서 사용자에게 가장 적합한 스터디 3개를 추천해주세요.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

[
  {"studyId": 숫자, "title": "스터디 제목", "reason": "추천 이유 (1-2문장)"},
  {"studyId": 숫자, "title": "스터디 제목", "reason": "추천 이유 (1-2문장)"},
  {"studyId": 숫자, "title": "스터디 제목", "reason": "추천 이유 (1-2문장)"}
]
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.5",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: { message: "AI 응답이 없습니다" } };
    }

    // JSON 파싱
    const recommendations: RecommendedStudy[] = JSON.parse(content);

    // 추천된 스터디 상세 정보 조회
    const recommendedStudyIds = recommendations.map((r) => r.studyId);
    const { data: recommendedStudies } = await supabase
      .from("studies")
      .select(
        `
        *,
        profiles:creator_id (username, avatar_url)
      `,
      )
      .in("id", recommendedStudyIds);

    // 추천 이유와 스터디 정보 합치기
    const result = recommendations.map((rec) => ({
      ...rec,
      study: recommendedStudies?.find((s) => s.id === rec.studyId),
    }));
    
    console.log('result', result)

    return { success: true, data: result };
  } catch (error: any) {
    console.log('error', error)
    return {
      success: false,
      error: { message: "AI 추천 중 오류가 발생했습니다" },
    };
  }
}


