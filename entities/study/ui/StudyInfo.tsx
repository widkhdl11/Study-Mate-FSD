import { StudyDetailView } from "@/entities/study/api/query/studyDetail/types";
import { Card } from "@/shared/shadcn/ui/card";
import { formatDate } from "date-fns";

export default function StudyInfo({ study }: { study: StudyDetailView }) {
  return (
    <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
        스터디 정보
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="text-center p-4 bg-muted/50 rounded-lg flex flex-col h-24">
            <p className="text-2xl font-bold text-foreground flex-1 flex items-center justify-center">
            {study.participants?.length ?? 0}
            </p>
            <p className="text-sm text-muted-foreground mt-2 flex-shrink-0">현재 멤버</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg flex flex-col h-24">
            <p className="text-2xl font-bold text-foreground flex-1 flex items-center justify-center">
            {study.maxParticipants}
            </p>
            <p className="text-sm text-muted-foreground mt-2 flex-shrink-0">최대 인원</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg flex flex-col h-24">
            <p className="text-2xl font-bold text-foreground flex-1 flex items-center justify-center">
            {study.posts?.length ?? 0}
            </p>
            <p className="text-sm text-muted-foreground mt-2 flex-shrink-0">모집글</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg flex flex-col h-24">
            <p className="text-2xs font-bold text-foreground flex-1 flex items-center justify-center">
            {formatDate(new Date(study.createdAt), "yyyy년 MM월 dd일")}
            </p>
            <p className="text-sm text-muted-foreground mt-2 flex-shrink-0">생성일</p>
        </div>
        </div>
    </Card>
)
}