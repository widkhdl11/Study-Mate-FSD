import { queryMyChatRooms } from "@/entities/chat";
import { queryMyParticipations } from "@/entities/participant";
import { queryMyStudies } from "@/entities/study";
import { createClient } from "@/shared/api/supabase/server";
import { tryAuth } from "@/shared/lib/auth";
import { ArrowRight, BookOpen, Clock, MessageCircle, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";

type Stat = {
    icon: LucideIcon;
    value: number;
    label: string;
    href: string;
    hl: string; // 형광펜 코딩
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

    const [participationsRes, myStudiesRes, chatRoomsRes] = await Promise.all([
        queryMyParticipations(supabase, auth.user.id),
        queryMyStudies(supabase, auth.user.id),
        queryMyChatRooms(supabase, auth.user.id),
    ]);

    const participations = participationsRes.ok ? participationsRes.value : [];
    const participating = participations.filter((p) => p.status === "accepted").length;
    const pending = participations.filter((p) => p.status === "pending").length;
    const created = myStudiesRes.ok ? myStudiesRes.value.length : 0;
    const unread = chatRoomsRes.ok
        ? chatRoomsRes.value.reduce((sum, r) => sum + r.unreadCount, 0)
        : 0;

    // 요약할 활동이 없으면 빈 카드 대신 섹션 자체를 숨긴다.
    if (participating + pending + created + unread === 0) return null;

    const stats: Stat[] = [
        { icon: Users, value: participating, label: "참여 중 스터디", href: "/profile?tab=studies", hl: "bg-hl-mint" },
        { icon: Clock, value: pending, label: "신청 대기", href: "/profile?tab=studies", hl: "bg-hl-yellow" },
        { icon: BookOpen, value: created, label: "내가 개설", href: "/profile?tab=studies", hl: "bg-hl-sky" },
        { icon: MessageCircle, value: unread, label: "안 읽은 메시지", href: "/profile?tab=chats", hl: "bg-hl-coral" },
    ];

    return (
        <section className="bg-paper px-4 py-10 text-ink sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-5 space-y-1">
                    <h2 className="font-heading text-2xl font-normal text-ink">내 활동</h2>
                    <p className="text-sm text-ink-soft">이번 주 참여 현황을 한눈에</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    {stats.map((s) => (
                        <Link
                            key={s.label}
                            href={s.href}
                            className="group flex flex-col justify-between gap-6 rounded-xl border-2 border-ink/15 bg-paper p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-ink/40 hover:shadow-lift"
                        >
                            <div className="flex items-center justify-between">
                                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.hl} text-ink`}>
                                    <s.icon className="h-5 w-5" aria-hidden="true" strokeWidth={2.25} />
                                </span>
                                <ArrowRight className="h-4 w-4 -translate-x-1 text-ink/40 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-ink group-hover:opacity-100" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold tabular-nums text-ink">
                                    {s.value}
                                </div>
                                <div className="mt-1 text-sm text-ink-soft">{s.label}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
