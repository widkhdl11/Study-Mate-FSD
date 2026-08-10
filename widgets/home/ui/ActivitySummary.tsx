import { queryMyParticipations } from "@/entities/participant";
import { queryMyStudies } from "@/entities/study";
import { createClient } from "@/shared/api/supabase/server";
import { tryAuth } from "@/shared/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn/ui/card";
import { BookOpen, Clock, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";

type Stat = {
    icon: LucideIcon;
    value: number;
    label: string;
    href: string;
};

/**
 * 홈 상단 "내 활동" 요약 — 로그인 유저 전용. 참여 중/신청 대기/개설 스터디를 액션 타일로.
 * 활동이 하나도 없으면(신규 유저) 카드를 숨긴다(히어로 + AI 콜드스타트가 커버).
 * (안 읽은 채팅 지표는 백엔드 미구현이라 제외)
 */
export default async function ActivitySummary() {
    const supabase = await createClient();
    const auth = await tryAuth(supabase);
    if (!auth.success) return null;

    const [participationsRes, myStudiesRes] = await Promise.all([
        queryMyParticipations(supabase, auth.user.id),
        queryMyStudies(supabase, auth.user.id),
    ]);

    const participations = participationsRes.ok ? participationsRes.value : [];
    const participating = participations.filter((p) => p.status === "accepted").length;
    const pending = participations.filter((p) => p.status === "pending").length;
    const created = myStudiesRes.ok ? myStudiesRes.value.length : 0;

    // 요약할 활동이 없으면 빈 카드 대신 섹션 자체를 숨긴다.
    if (participating + pending + created === 0) return null;

    const stats: Stat[] = [
        { icon: Users, value: participating, label: "참여 중 스터디", href: "/profile?tab=studies" },
        { icon: Clock, value: pending, label: "신청 대기", href: "/profile?tab=studies" },
        { icon: BookOpen, value: created, label: "내가 개설", href: "/profile?tab=studies" },
    ];

    return (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">내 활동</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        {stats.map((s) => (
                            <Link
                                key={s.label}
                                href={s.href}
                                className="group flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                            >
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <s.icon className="h-4 w-4" aria-hidden="true" />
                                    {s.label}
                                </span>
                                <span className="text-3xl font-bold tabular-nums text-foreground">
                                    {s.value}
                                </span>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
