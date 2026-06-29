"use client";

import { StudyResponse } from "@/entities/study";
import { StudyCategoryBadges } from "@/entities/study/ui/StudyCategoryBadges";
import { StudyRegionLabel } from "@/entities/study/ui/StudyRegionLabel";
import { getCategoryPathByValue } from "@/shared/config/study-category";
import { studyStatusConversion } from "@/shared/lib/conversion/study";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card } from "@/shared/shadcn/ui/card";
import { TabsContent } from "@/shared/shadcn/ui/tabs";
import { Users } from "lucide-react";
import Link from "next/link";
export default function MyStudiesTab({
  myStudies,
  getStatusColor,
}: {
  myStudies: StudyResponse[];
  getStatusColor: (status: string) => string;
}) {
  return (
    <>
      <TabsContent value="studies" className="space-y-4">
        {myStudies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myStudies.map((study: StudyResponse) => (
              <Link key={study.id} href={`/studies/${study.id}`}>
                <Card className="group overflow-hidden hover:shadow-md transition-all h-full cursor-pointer p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {study.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {study.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StudyCategoryBadges categoryPath={getCategoryPathByValue(study.studyCategory)} />
                
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                       <StudyRegionLabel region={study.region} />
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-xs">
                            {study.currentParticipants}/{study.maxParticipants}명
                        </span>
                      </div>
                      {/* <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs">{study.studies.meetingDate}</span>
                      </div> */}
                    </div>
                    <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${
                            (study.currentParticipants / study.maxParticipants) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Badge className={getStatusColor(study.status)}>
                      {studyStatusConversion(study.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">관리</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">참여중인 스터디가 없습니다.</p>
            <Link href="/studies/create">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                스터디 만들기
              </Button>
            </Link>
          </Card>
        )}
      </TabsContent>
    </>
  );
}
