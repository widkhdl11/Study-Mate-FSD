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
      <Card className="p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">
            스터디 만들기
          </h2>

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
                    <FormLabel>스터디 제목</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="스터디 제목을 입력해주세요"
                        disabled={isPending}
                        type="text"
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
                    <FormLabel>카테고리 (대분류)</FormLabel>
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
                      <SelectTrigger>
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
                    <FormLabel>카테고리 (중분류)</FormLabel>
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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="중분류 선택" />
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
                    <FormLabel>카테고리 (소분류)</FormLabel>
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
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="소분류 선택" />
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

              {/* 시/도 */}
              <FormField
                control={form.control}
                name="mainRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>지역 (시/도)</FormLabel>
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
                      <SelectTrigger>
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
                        <FormLabel>지역 (시/군/구)</FormLabel>
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
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="시/군/구 선택" />
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

              {/* 최대 인원 */}
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>최대 인원</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2"
                        max="20"
                        placeholder="2-20명"
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
                    <FormLabel>설명</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="스터디에 대해 설명해주세요."
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
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isPending}
                >
                  {isPending ? "만드는 중..." : "스터디 만들기"}
                </Button>
                <Link href="/" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
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