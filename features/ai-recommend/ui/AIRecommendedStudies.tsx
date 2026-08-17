"use client";

import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAIRecommendedPosts } from "../model/useAgent";
import { RecommendedStudyCard } from "./RecommendedStudyCard";

// AI 추천은 전용 콤팩트 카드(RecommendedStudyCard)를 쓴다 — 이미지 신뢰 불가 + 개념상
// '스터디'(이미지 없음)라 최신 모집글의 이미지 카드와 구조가 달라야 하므로 분리했다.

// 다른 홈 섹션과 동일한 섹션 셸(밴드 + max-w-7xl + 대형 헤더). 플래너 월드에선
// 전 섹션이 종이 바탕(bg-paper)으로 이어지고, 구분은 색이 아니라 헤더·간격으로 한다.
function SectionShell({
    summary,
    children,
}: {
    summary?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="bg-paper px-4 py-16 text-ink sm:px-6 md:py-20 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="space-y-2">
                    <h2 className="flex items-center gap-2.5 font-heading text-3xl font-normal text-ink md:text-4xl">
                        <Sparkles className="h-7 w-7 text-ink md:h-8 md:w-8" />
                        AI 추천 스터디
                    </h2>
                    <p className="max-w-2xl text-pretty leading-relaxed text-ink-soft">
                        {summary ?? "회원님의 관심사를 바탕으로 딱 맞는 스터디를 골라봤어요"}
                    </p>
                </div>
                {children}
            </div>
        </section>
    );
}

export function AIRecommendedStudies() {
    const { data: recommendation, isLoading, error } = useAIRecommendedPosts();

    if (isLoading) {
        return (
            <SectionShell>
                <div className="flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-paper-line py-16 text-ink-soft">
                    <Loader2 className="h-5 w-5 animate-spin text-ink" />
                    <span>AI가 회원님께 맞는 스터디를 고르는 중…</span>
                </div>
            </SectionShell>
        );
    }

    // 로그인 필요·추천 없음(신규 유저) 등이면 죽은 카드 대신 섹션 자체를 숨긴다.
    if (error || !recommendation || recommendation.posts.length === 0) {
        return null;
    }

    return (
        <SectionShell summary={recommendation.summary}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendation.posts.map((post, index) => (
                    <Link key={post.id} href={`/posts/${post.id}`}>
                        <RecommendedStudyCard post={post} rank={index + 1} />
                    </Link>
                ))}
            </div>
        </SectionShell>
    );
}
