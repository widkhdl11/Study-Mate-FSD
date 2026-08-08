import { Button } from "@/shared/shadcn/ui/button";
import { Card } from "@/shared/shadcn/ui/card";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type EmptyStateProps = {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: { label: string; href: string };
};

/** 목록이 비었을 때 공용 빈 상태 카드 — 제목 + 설명 + (선택)CTA. 프로필 탭 등에서 공유. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
            {Icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
            )}
            <div className="space-y-1">
                <p className="font-semibold text-foreground">{title}</p>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {action && (
                <Button asChild className="mt-2">
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            )}
        </Card>
    );
}
