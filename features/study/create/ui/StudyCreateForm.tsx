'use client'

import { CreateStudyCommand, studyCreateSchema } from "@/entities/study";
import { useCreateStudy } from "../model/useCreateStudy";
import { getMainRegion, getSubRegion } from "@/shared/config/region";
import { getDetailCategories, getMainCategories, getSubcategories } from "@/shared/config/study-category";
import { Button } from "@/shared/shadcn/ui/button";
import { Card } from "@/shared/shadcn/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/shadcn/ui/form";
import { Input } from "@/shared/shadcn/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select";
import { Textarea } from "@/shared/shadcn/ui/textarea";
import { zodResolverFirstError } from "@/shared/lib/validation";
import Link from "next/link";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";

export default function StudyCreateForm() {
  const form = useForm<CreateStudyCommand>({
    resolver: zodResolverFirstError(studyCreateSchema),
    defaultValues: {
      title: "",
      mainCategory: "",
      subCategory: "",
      detailCategory: "",
      studyCategory: "",
      mainRegion: "",
      detailRegion: "",
      region: "",
      maxParticipants: 2,
      description: "",
    },
  });
  const { mutate: createStudyMutation, isPending } = useCreateStudy((field, message)=>{
    form.setError(field as keyof CreateStudyCommand, {
      type: "server",
      message,
    });
  });


  async function onSubmit(_data: CreateStudyCommand, event?: BaseSyntheticEvent) {
    const formEl = event?.target as HTMLFormElement | undefined;
    if (!formEl) return;
    const formData = new FormData(formEl);
    createStudyMutation(formData);
  }
  const [mainCategoryValue, setMainCategoryValue] = useState("");
  const [subCategoryValue, setSubCategoryValue] = useState("");
  const [detailCategoryValue, setDetailCategoryValue] = useState("");
  const [studyCategoryValue, setStudyCategoryValue] = useState("");
  const [mainRegionValue, setMainRegionValue] = useState("");
  const [detailRegionValue, setDetailRegionValue] = useState("");
  const [regionValue, setRegionValue] = useState("");

  const mainCategories = getMainCategories();
  const subcategories = getSubcategories(mainCategoryValue)
  const detailCategories = getDetailCategories(mainCategoryValue, subCategoryValue)

  const mainRegions = getMainRegion();
  const detailRegions = getSubRegion(mainRegionValue)

  return (
      <Card className="bg-paper border-2 border-ink/15 shadow-soft p-6 md:p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
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
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 카테고리 (대/중/소) — 한 줄로 그룹 */}
              <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="mainCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ink font-semibold">대분류</FormLabel>
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
                    >
                      <SelectTrigger className="w-full border-2 border-ink/15 bg-paper text-ink data-[placeholder]:text-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30">
                        <SelectValue placeholder="대분류 선택" />
                      </SelectTrigger>
                      <SelectContent>
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
                    <FormLabel className="text-ink font-semibold">중분류</FormLabel>
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
                      disabled={isPending || subcategories.length === 0}
                    >
                      <SelectTrigger className="w-full border-2 border-ink/15 bg-paper text-ink data-[placeholder]:text-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30">
                        <SelectValue placeholder={mainCategoryValue ? "중분류 선택" : "대분류 먼저 선택"} />
                      </SelectTrigger>
                      <SelectContent>
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

              {/* 소분류 - 여기서 studyCategory 계산! */}
              <FormField
                control={form.control}
                name="detailCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ink font-semibold">소분류</FormLabel>
                    <Select
                      key={`detail-${mainCategoryValue}-${subCategoryValue}`}
                      value={detailCategoryValue}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setDetailCategoryValue(value);
                        
                        if (value) {
                          setStudyCategoryValue(value);
                          form.setValue("studyCategory", value, {
                            shouldValidate: true,
                          });
                        }
                      }}
                      disabled={isPending || detailCategories.length === 0}
                    >
                      <SelectTrigger className="w-full border-2 border-ink/15 bg-paper text-ink data-[placeholder]:text-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30">
                        <SelectValue placeholder={subCategoryValue ? "소분류 선택" : "중분류 먼저 선택"} />
                      </SelectTrigger>
                      <SelectContent>
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
              </div>

              {/* 지역 (시/도 + 시/군/구) — 한 줄로 그룹 */}
              <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="mainRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ink font-semibold">시/도</FormLabel>
                    <Select
                      value={mainRegionValue}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setMainRegionValue(value);
                        setDetailRegionValue("");
                        
                        if (value === "ONLINE") {
                          setRegionValue("");
                          form.setValue("region", "", {
                            shouldValidate: true,
                          });
                        } else {
                          // 오프라인 선택 시 초기화
                          setRegionValue("");
                          form.setValue("region", "");
                        }
                      }}
                    >
                      <SelectTrigger className="w-full border-2 border-ink/15 bg-paper text-ink data-[placeholder]:text-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30">
                        <SelectValue placeholder="시/도 선택" />
                      </SelectTrigger>
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

              {/* 시/군/구 - 여기서 region 계산! */}
  
                  <FormField
                    control={form.control}
                    name="detailRegion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-ink font-semibold">시/군/구</FormLabel>
                        <Select
                          key={`sub-region-${mainRegionValue}`}
                          value={detailRegionValue}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setDetailRegionValue(value);
                            
                            if (value) {
                              setRegionValue(value);
                              form.setValue("region", value, {
                                shouldValidate: true,
                              });
                            }
                          }}
                          disabled={isPending || detailRegions.length === 0}
                        >
                          <SelectTrigger className="w-full border-2 border-ink/15 bg-paper text-ink data-[placeholder]:text-ink-soft focus-visible:border-ink/40 focus-visible:ring-ink/30">
                            <SelectValue placeholder={mainRegionValue ? "시/군/구 선택" : "시/도 먼저 선택"} />
                          </SelectTrigger>
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
              </div>

              {/* 최대 인원 */}
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem className="sm:max-w-[12rem]">
                    <FormLabel className="text-ink font-semibold">최대 인원</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2"
                        max="20"
                        placeholder="2-20명"
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
                        placeholder="스터디에 대해 설명해주세요."
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
                  {isPending ? "만드는 중..." : "스터디 만들기"}
                </Button>
                <Link href="/" className="flex-1">
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
            </form>
          </Form>
        </Card>
  )
}