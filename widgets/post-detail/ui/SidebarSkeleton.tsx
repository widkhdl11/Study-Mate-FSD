import { Card } from "@/shared/shadcn/ui/card";

export default function SidebarSkeleton() {
  return (
    <div className="lg:col-span-1">
      <Card className="p-6 sticky top-20 shadow-sm animate-pulse">
        <div className="space-y-4">
          <div className="h-6 w-20 bg-muted rounded" />
          <div className="h-6 w-3/4 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-muted rounded" />
            <div className="h-6 w-20 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-2 w-full bg-muted rounded-full" />
          </div>
          <div className="h-16 w-full bg-muted rounded" />
          <div className="flex gap-3 p-3 bg-muted rounded-lg">
            <div className="h-8 w-8 rounded-full bg-muted-foreground/20" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-12 bg-muted-foreground/20 rounded" />
              <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
            </div>
          </div>
          <div className="h-12 w-full bg-muted rounded" />
        </div>
      </Card>
    </div>
  );
}
