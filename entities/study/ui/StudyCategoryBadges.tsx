import { Badge } from "@/shared/shadcn/ui/badge";

export type CategoryPath = {
    labels: string[];
    values: string[];
    codes: number[];
}

export function StudyCategoryBadges({categoryPath}: {categoryPath: CategoryPath}) {
    return (
        <>
        {categoryPath.labels.map((category,i) => (
            <Badge
            variant="outline"
            key={i}
            className="bg-blue-100 text-blue-700 border-blue-200"
            >
                    {category}
                </Badge>
        ))}
        </>
    )
}