'use client'

import { UpdatePostCommand } from "@/entities/post";
import { StudyResponse } from "@/entities/study";
import { getRegionPath } from "@/shared/config/region";
import { getCategoryPath } from "@/shared/config/study-category";
import { Badge } from "@/shared/shadcn/ui/badge";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/shadcn/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select";
import { MapPin, Tag, Users } from "lucide-react";
import { use } from "react";
import { Control, useWatch } from "react-hook-form";

export default function StudySelectField({ 
studiesPromise,
  control,
  isPending,
}: {
  studiesPromise: Promise<StudyResponse[]>;
  control: Control<UpdatePostCommand>;
  isPending: boolean;
}) {
  const studies = use(studiesPromise);
  const studyId = useWatch({ control, name: "studyId" });
  const selectedStudy = studies.find((s) => s.id === Number(studyId));
    return (
         <FormField
                control={control}
                name="studyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>스터디 선택 *</FormLabel>
                    <FormDescription>모집글을 작성할 스터디를 선택해주세요</FormDescription>
                    <Select
                      value={field.value?.toString()} 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="스터디를 선택해주세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {studies?.map((study) => (
                          <SelectItem key={study.id} value={study.id.toString()}>
                            {study.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {selectedStudy && (
                      <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{selectedStudy.title}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Tag className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="shrink-0">카테고리</span>
                            <div className="flex items-center pr-2">
                            {getCategoryPath(Number(selectedStudy.studyCategory)).labels.map((category) => (
                              <Badge key={category} variant="secondary" className="m-auto">{category}</Badge>
                            ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 w-full">
                            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="shrink-0">지역</span>
                            <div className="w-full flex justify-start shrink-1">
                            {getRegionPath(Number(selectedStudy.region)).labels.map((region) => (
                              <Badge key={region} variant="outline" className="m-1">{region}</Badge>
                            ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 col-span-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>모집 인원</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {selectedStudy.currentParticipants}/{selectedStudy.maxParticipants}명
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />
    )
}