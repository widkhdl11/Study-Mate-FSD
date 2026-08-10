"use server";

import { AIRecommendationResult, PostRecommendedRow, toPostRecommendedView } from "../model/types";
import { buildInterestProfile, InterestProfile } from "../model/interestProfile";
import { ActionResponse } from "@/shared/kernel/actionType";
import { createClient } from "@/shared/api/supabase/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 관심 프로필 → 프롬프트 블록. 신호가 있으면 관심사 우선, 없으면(콜드스타트) 최신·인기 폭넓게.
function interestPromptBlock(profile: InterestProfile): string {
  if (!profile.hasSignals) {
    return `## 사용자 관심 프로필
아직 활동 이력이 없는 신규 사용자입니다. 특정 관심사에 치우치지 말고, 최신이면서 인기 있는(좋아요·조회 많은) 모집글 위주로 폭넓게 추천하세요.`;
  }
  return `## 사용자 관심 프로필 (행동에서 유추)
- 관심 카테고리: ${profile.topCategories.join(", ") || "정보 없음"}
- 관심 지역: ${profile.topRegions.join(", ") || "정보 없음"}
- 현재 활동: 참여 중 ${profile.activity.participating}개 · 신청 대기 ${profile.activity.pending}개 · 개설 ${profile.activity.created}개
위 관심 카테고리·지역과 활동 맥락에 가장 잘 맞는 글을 우선 추천하세요.`;
}

export async function getAIRecommendedPosts(): Promise<ActionResponse<AIRecommendationResult>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: { message: "로그인이 필요합니다" } };
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // #2·#3 통합: 행동 신호로 관심 프로필을 만들어 추천 입력을 강화한다.
  const interest = await buildInterestProfile(supabase, user.id);

  // 후보군은 최신순으로 넉넉히(12개) 뽑아 AI가 관심·인기 기준으로 4개를 고르게 한다.
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
    .order("created_at", { ascending: false })
    .limit(12);

  if (!posts || posts.length === 0) {
    return { success: false, error: { message: "추천할 스터디가 없습니다" } };
  }

  // 이미 참여 중(accepted)인 스터디의 글은 추천 후보에서 제외 — 이미 들어간 스터디를 또 추천하지 않는다.
  const exclude = new Set(interest.excludeStudyIds);
  const candidates = posts.filter((p) => !exclude.has(p.study_id));
  if (candidates.length === 0) {
    return { success: false, error: { message: "추천할 스터디가 없습니다" } };
  }

  const prompt = `
당신은 스터디 매칭 전문가입니다.

## 사용자 정보
- 이름: ${profileRow?.username || "사용자"}

${interestPromptBlock(interest)}

## 모집 중인 게시글 목록
${candidates.map((p, i) => `
${i + 1}. [ID: ${p.id}] ${p.title}
   - 내용: ${p.content}
   - 이미지: ${p.image_url}
   - 스터디: ${p.study?.title}
   - 스터디 카테고리: ${p.study?.study_category}
   - 스터디 지역: ${p.study?.region}
   - 스터디 인원: ${p.study?.current_participants}/${p.study?.max_participants}명
   - 좋아요: ${p.likes_count ?? 0} · 조회: ${p.views_count ?? 0}
   - 작성자: ${p.author?.username}
   - 작성자 이미지: ${p.author?.avatar_url}
`).join("")}

## 요청
위 게시글 중 사용자에게 가장 적합한 4개를 추천하세요(부족하면 있는 만큼).
JSON 객체로만 응답하세요. 다른 텍스트 없이.
- "summary": 왜 이 글들을 골랐는지 사용자에게 건네는 한 문장(존댓말, 40자 내외). 신규 사용자면 "지금 활발한 모집글을 모아봤어요"처럼 중립적으로.
- "recommendations": 추천 게시글 배열.
반환 형식:
{
  "summary": "한 문장 요약",
  "recommendations": [
    {
      "id": 숫자,
      "title": "게시글 제목",
      "content": "게시글 내용",
      "image_url": [
        { "id": 숫자, "url": "게시글 이미지 URL", "originalName": "원본 이름", "size": 숫자 }
      ],
      "study": {
        "id": 숫자,
        "title": "스터디 제목",
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
}
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

    // Gemini raw JSON(snake) = Row → 경계에서 camel View로 매핑
    const parsed = JSON.parse(content) as { summary?: string; recommendations?: PostRecommendedRow[] };
    const rows = parsed.recommendations ?? [];
    const summary = parsed.summary?.trim() || "회원님께 어울리는 모집글을 골라봤어요";

    return { success: true, data: { summary, posts: rows.map(toPostRecommendedView) } };
  } catch {
    return {
      success: false,
      error: { message: "AI 추천 중 오류가 발생했습니다" },
    };
  }
}