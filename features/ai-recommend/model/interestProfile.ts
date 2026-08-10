import { queryMyLikedStudies } from "@/entities/post";
import { queryMyParticipations } from "@/entities/participant";
import { queryMyStudies } from "@/entities/study";
import { queryMyPostsWithStudy } from "@/entities/post";
import { getRegionLabelByCode } from "@/shared/config/region";
import { getCategoryLabelByCode } from "@/shared/config/study-category";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * 행동에서 유추한 관심 프로필. profiles에 관심사 컬럼이 없어(온보딩 강요 회피)
 * 참여·생성·작성·좋아요 신호를 가중 합산해 파생한다.
 */
export type InterestProfile = {
    hasSignals: boolean;
    topCategories: string[]; // 라벨, 가중치 내림차순
    topRegions: string[]; // 라벨, 가중치 내림차순
    activity: {
        participating: number; // 승인되어 참여 중
        pending: number; // 신청 후 대기
        created: number; // 내가 만든 스터디
    };
};

// 신호 세기 — 직접 참여/생성이 좋아요보다 관심을 강하게 반영한다.
const WEIGHT = {
    participationAccepted: 3,
    participationPending: 2,
    created: 3,
    authored: 2,
    liked: 1,
} as const;

function categoryLabel(code: string): string | null {
    const n = Number(code);
    if (!Number.isFinite(n)) return null;
    return getCategoryLabelByCode(n) || null;
}

function regionLabel(code: string): string | null {
    if (code === "ONLINE") return "온라인";
    const n = Number(code);
    if (!Number.isFinite(n)) return null;
    return getRegionLabelByCode(n) || null;
}

function topLabels(weights: Map<string, number>, limit: number): string[] {
    return [...weights.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([label]) => label);
}

/**
 * 사용자의 관심 프로필을 집계한다. 개별 쿼리 실패는 조용히 건너뛰어(부분 실패 허용)
 * 신호가 하나도 없으면 hasSignals=false로 콜드스타트를 알린다.
 */
export async function buildInterestProfile(
    supabase: SupabaseClient,
    userId: string,
): Promise<InterestProfile> {
    const [participationsRes, myStudiesRes, myPostsRes, likedRes] = await Promise.all([
        queryMyParticipations(supabase, userId),
        queryMyStudies(supabase, userId),
        queryMyPostsWithStudy(supabase, userId),
        queryMyLikedStudies(supabase, userId),
    ]);

    const categoryWeights = new Map<string, number>();
    const regionWeights = new Map<string, number>();

    const add = (map: Map<string, number>, label: string | null, weight: number) => {
        if (!label) return;
        map.set(label, (map.get(label) ?? 0) + weight);
    };

    const addStudy = (category: string, region: string, weight: number) => {
        add(categoryWeights, categoryLabel(category), weight);
        add(regionWeights, regionLabel(region), weight);
    };

    let participating = 0;
    let pending = 0;

    if (participationsRes.ok) {
        for (const p of participationsRes.value) {
            const accepted = p.status === "accepted";
            if (accepted) participating += 1;
            else if (p.status === "pending") pending += 1;
            addStudy(
                p.studyCategory,
                p.region,
                accepted ? WEIGHT.participationAccepted : WEIGHT.participationPending,
            );
        }
    }

    const created = myStudiesRes.ok ? myStudiesRes.value.length : 0;
    if (myStudiesRes.ok) {
        for (const s of myStudiesRes.value) addStudy(s.studyCategory, s.region, WEIGHT.created);
    }

    if (myPostsRes.ok) {
        for (const p of myPostsRes.value) addStudy(p.study.studyCategory, p.study.region, WEIGHT.authored);
    }

    if (likedRes.ok) {
        for (const l of likedRes.value) addStudy(l.studyCategory, l.region, WEIGHT.liked);
    }

    const topCategories = topLabels(categoryWeights, 3);
    const topRegions = topLabels(regionWeights, 2);
    const hasSignals =
        topCategories.length > 0 || topRegions.length > 0 || participating + pending + created > 0;

    return {
        hasSignals,
        topCategories,
        topRegions,
        activity: { participating, pending, created },
    };
}
