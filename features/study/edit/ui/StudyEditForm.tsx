'use client'

import { UpdateStudyCommand, studyUpdateSchema } from "@/entities/study";
import { StudyEditFormValues } from "../model/types";
import { getMainRegion, getSubRegion } from "@/shared/config/region";
import { getCategoryCodeByValue, getDetailCategories, getMainCategories, getSubcategories } from "@/shared/config/study-category";
import { zodResolverFirstError } from "@/shared/lib/validation";
import { Button } from "@/shared/shadcn/ui/button";
import { Card } from "@/shared/shadcn/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/shadcn/ui/form";
import { Input } from "@/shared/shadcn/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select";
import { Textarea } from "@/shared/shadcn/ui/textarea";
import Link from "next/link";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { useUpdateStudy } from "../model/useUpdateStudy";

export default function StudyEditForm({ 
  initialData, studyId
}: {
  initialData: StudyEditFormValues
  , studyId: string
}) {
  const form = useForm<UpdateStudyCommand>({
    
    resolver: zodResolverFirstError(studyUpdateSchema),
    defaultValues: initialData, 
  });
  const {mutate: updateStudyMutation, isPending} = useUpdateStudy((field ,message)=>{
    form.setError(field as keyof UpdateStudyCommand, {
      type: "server",
      message,
    });
  });


  async function onSubmit(_data: UpdateStudyCommand, event?: BaseSyntheticEvent) {
    const formEl = event?.target as HTMLFormElement | undefined;
    if (!formEl) return;
    const formData = new FormData(formEl);
    updateStudyMutation(formData);
  }

    // 카테고리 상태
  const [mainCategoryValue, setMainCategoryValue] = useState(initialData.mainCategory);
  const [subCategoryValue, setSubCategoryValue] = useState(initialData.subCategory);
  const [detailCategoryValue, setDetailCategoryValue] = useState(initialData.detailCategory);
  const [studyCategoryValue, setStudyCategoryValue] = useState(initialData.studyCategory);

  // 지역 상태
  const [mainRegionValue, setMainRegionValue] = useState(initialData.mainRegion);
  const [detailRegionValue, setDetailRegionValue] = useState(initialData.detailRegion);
  const [regionValue, setRegionValue] = useState(initialData.region);


  // 동적 옵션
  const mainCategories = getMainCategories();
  const subcategories = getSubcategories(mainCategoryValue)
  const detailCategories = getDetailCategories(mainCategoryValue, subCategoryValue)

  const mainRegions = getMainRegion();
  const detailRegions = getSubRegion(mainRegionValue)
  return (
        <Card className="bg-paper border-2 border-ink/15 shadow-soft p-6 md:p-8">
          <h2 className="mb-6 font-heading text-2xl font-normal text-ink">
            스터디 수정하기
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* 제목 */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ink font-semibold">스터디 제목</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="스터디 제목을 입력해주세요"
                        className="border-2 border-ink/15 bg-paper text-ink placeholder-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 대분류 */}
              <FormField
                control={form.control}
                name="mainCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ink font-semibold">카테고리 (대분류)</FormLabel>
                    <Select
                      value={mainCategoryValue}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setMainCategoryValue(value);
                        setSubCategoryValue("");
                        setDetailCategoryValue("");
                        setStudyCategoryValue("");
                        form.setValue("studyCategory", "");
                      }}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-2 border-ink/15 bg-paper text-ink data-[placeholder]:text-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30">
                          <SelectValue placeholder="대분류 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="전체">
                          전체
                        </SelectItem>
                        {mainCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 중분류 */}
              <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ink font-semibold">카테고리 (중분류)</FormLabel>
                    <Select
                      key={`sub-${mainCategoryValue}`}
                      value={subCategoryValue}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSubCategoryValue(value);
                        setDetailCategoryValue("");
                        setStudyCategoryValue("");
                        form.setValue("studyCategory", "");
                      }}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-2 border-ink/15 bg-paper text-ink data-[placeholder]:text-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30">
                          <SelectValue placeholder="중분류 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="전체">
                          전체
                        </SelectItem>
                        {subcategories.map((sub) => (
                          <SelectItem key={sub.value} value={sub.value}>
                            {sub.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 소분류 */}
              <FormField
                control={form.control}
                name="detailCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ink font-semibold">카테고리 (소분류)</FormLabel>
                    <Select
                      key={`detail-${mainCategoryValue}-${subCategoryValue}`}
                      value={detailCategoryValue}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setDetailCategoryValue(value);
                        const code = getCategoryCodeByValue(value);
                        if (code) {
                          setStudyCategoryValue(value);
                          form.setValue("studyCategory", value, {
                            shouldValidate: true,
                          });
                        }
                      }}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-2 border-ink/15 bg-paper text-ink data-[placeholder]:text-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30">
                          <SelectValue placeholder="소분류 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="전체">
                          전체
                        </SelectItem>
                        {detailCategories.map((detail) => (
                          <SelectItem key={detail.value} value={detail.value}>
                            {detail.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 시/도 */}
              <FormField
                control={form.control}
                name="mainRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ink font-semibold">지역 (시/도)</FormLabel>
                    <Select
                      value={mainRegionValue}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setMainRegionValue(value);
                        setDetailRegionValue("");

                        if (value === "ONLINE") {
                          setRegionValue("ONLINE");
                          form.setValue("region", "ONLINE", {
                            shouldValidate: true,
                          });
                        } else {
                          setRegionValue("");
                          form.setValue("region", "");
                        }
                      }}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-2 border-ink/15 bg-paper text-ink data-[placeholder]:text-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30">
                          <SelectValue placeholder="시/도 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mainRegions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 시/군/구 */}
       
                  <FormField
                    control={form.control}
                    name="detailRegion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-ink font-semibold">지역 (시/군/구)</FormLabel>
                        <Select
                          key={`sub-region-${mainRegionValue}`}
                          value={detailRegionValue}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setDetailRegionValue(value);
                              setRegionValue(value);
                              form.setValue("region", value, {
                                shouldValidate: true,
                              });
                          }}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full border-2 border-ink/15 bg-paper text-ink data-[placeholder]:text-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30">
                              <SelectValue placeholder="시/군/구 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {detailRegions.map((sub) => (
                              <SelectItem key={sub.value} value={sub.value}>
                                {sub.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

              {/* 최대 인원 */}
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ink font-semibold">최대 인원</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        placeholder="1-20명"
                        className="border-2 border-ink/15 bg-paper text-ink placeholder-ink-soft tabular-nums focus-visible:border-ink/40 focus-visible:ring-ink/30"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 설명 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ink font-semibold">설명</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="스터디에 대해 설명해주세요 (최소 10자)"
                        className="border-2 border-ink/15 bg-paper text-ink placeholder-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30"
                        disabled={isPending}
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-ink text-paper hover:bg-ink/90 active:scale-[0.97]"
                  disabled={isPending}
                >
                  {isPending ? "저장 중..." : "수정 완료"}
                </Button>
                <Link href={`/studies/${studyId}`} className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-2 border-ink/20 bg-transparent text-ink hover:bg-ink/5 hover:text-ink"
                    disabled={isPending}
                  >
                    취소
                  </Button>
                </Link>
              </div>
              <input type="hidden" name="id" value={studyId} />
              <input
                type="hidden"
                name="mainCategory"
                value={mainCategoryValue}
              />
              <input
                type="hidden"
                name="subCategory"
                value={subCategoryValue}
              />
              <input
                type="hidden"
                name="detailCategory"
                value={detailCategoryValue}
              />
              <input
                type="hidden"
                name="mainRegion"
                value={mainRegionValue}
              />
              <input
                type="hidden"
                name="detailRegion"
                value={detailRegionValue}
              />
              
              <input
                type="hidden"
                name="studyCategory"
                value={studyCategoryValue}
              />
              <input type="hidden" name="region" value={regionValue} />
              <input type="hidden" name="updatedAt" value={initialData.updatedAt} />
            </form>
          </Form>
        </Card>
  )
}