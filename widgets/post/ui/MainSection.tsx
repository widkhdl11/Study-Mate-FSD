'use client'

import { PostWithStudyView } from "@/entities/post";
import { getImageUrl, getProfileImageUrl } from "@/shared/api/supabase/storage";
import { getMainRegion, getRegionCodeByValue, getRegionPath, getSubRegion } from "@/shared/config/region";
import {
  getCategoryCodeByValue,
  getCategoryPath,
  getDetailCategories,
  getMainCategories,
  getSubcategories,
} from "@/shared/config/study-category";
import { STUDY_STATUS } from "@/shared/config/study-status";
import { getStudyStatusExistValue, studyStatusConversion } from "@/shared/lib/conversion/study";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card } from "@/shared/shadcn/ui/card";
import { Input } from "@/shared/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/shadcn/ui/select";
import { Calendar, Eye, MapPin, Search, ThumbsUp, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";


export default function MainSection(
    { allPosts, search, initialCategory }: { allPosts: PostWithStudyView[], search?: string, initialCategory?: string }
) {

    const searchProp = search ?? "";
    const [searchQuery, setSearchQuery] = useState(searchProp);
    const [prevSearch, setPrevSearch] = useState(searchProp);

    // URL 검색어(search prop)가 바뀌면 입력창만 거기 맞춤. 필터는 유지(로컬 state 보존).
    if (searchProp !== prevSearch) {
        setPrevSearch(searchProp);
        setSearchQuery(searchProp);
    }

    const getStatusColor = (status: string) => {
    switch (status) {
      case "모집중":
        return "bg-success hover:bg-success/90 text-white";
      case "마감":
        return "bg-danger hover:bg-danger/90 text-white";
      case "수락 대기중":
        return "bg-warning hover:bg-warning/90 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const [selectedStatus, setSelectedStatus] = useState("전체 상태");
  // 홈 카테고리 섹션에서 넘어온 초기 대분류(URL ?category=<value>)로 필터 시작
  const [mainCategoryValue, setMainCategoryValue] = useState(initialCategory ?? "");
  const [subCategoryValue, setSubCategoryValue] = useState("");
  const [detailCategoryValue, setDetailCategoryValue] = useState("");
  const [mainRegionValue, setMainRegionValue] = useState("");
  const [detailRegionValue, setDetailRegionValue] = useState("");
  // 동적 옵션
  const mainCategories = getMainCategories();
  const subcategories = (mainCategoryValue !=="전체" && mainCategoryValue !== "")
    ? getSubcategories(mainCategoryValue)
    : [];
  const detailCategories = (mainCategoryValue !=="전체" && mainCategoryValue !== "") && subCategoryValue !=="전체" && subCategoryValue !== ""
    ? getDetailCategories(mainCategoryValue, subCategoryValue)
    : [];

  const mainRegions = getMainRegion();
  const regions = mainRegionValue ? getSubRegion(mainRegionValue) : [];

  const statuses = Object.values(STUDY_STATUS).map((status) => status.label);

  const filteredPosts = allPosts.filter((post: PostWithStudyView) => {

    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.study.description?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      post.study.title?.toLowerCase().includes(searchQuery.toLowerCase());

     let matchesCategory = true;
     if (detailCategoryValue && detailCategoryValue !== "전체") {
       // 소분류 선택됨
       const postCategory = Number(post.study?.studyCategory);
       const detailCategoryCode = Number(getCategoryCodeByValue(detailCategoryValue));
       matchesCategory = Math.floor(postCategory) === Math.floor(detailCategoryCode);

     } else if (subCategoryValue && subCategoryValue !== "전체") {
       // 중분류 선택됨 → 해당 중분류의 모든 소분류 포함
       const postCategory = Number(post.study?.studyCategory);
       const subCategoryCode = Number(getCategoryCodeByValue(subCategoryValue));

       matchesCategory = Math.floor(postCategory / 10) === Math.floor(subCategoryCode/10);
     } else if (mainCategoryValue && mainCategoryValue !== "전체") {
       // 대분류 선택됨 → 해당 대분류의 모든 중/소분류 포함
       const postCategory = Number(post.study?.studyCategory);
       const mainCategoryCode = Number(getCategoryCodeByValue(mainCategoryValue));
       // 예: 대분류 100 선택 → 101, 102, 10101, 10102 모두 포함
       matchesCategory = Math.floor(postCategory / 100) === Math.floor(mainCategoryCode/100);
     }
     let matchesRegion = true;
     if (detailRegionValue && detailRegionValue !== "전체") {
       // 시/군/구 선택됨
       const postRegion = Number(post.study?.region);
       const detailRegionCode = Number(getRegionCodeByValue(detailRegionValue));

       matchesRegion = Math.floor(postRegion) === Math.floor(detailRegionCode);
      } else if (mainRegionValue && mainRegionValue !== "전체") {
        // 시/도 선택됨 → 해당 시/도의 모든 시/군/구 포함
        const postRegion = Number(post.study?.region);
        const mainRegionCode = Number(getRegionCodeByValue(mainRegionValue));
        // 예: 서울(11) 선택 → 1101(강남), 1102(강북) 모두 포함
        matchesRegion = Math.floor(postRegion/1000) === Math.floor(mainRegionCode/1000);
     }
     const matchesStatus =
       selectedStatus === "전체 상태" || 
       post.study?.status === getStudyStatusExistValue(selectedStatus.trim());

     return matchesSearch && matchesCategory && matchesRegion && matchesStatus;
  });

    return (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Filters */}
              <aside className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <Card className="p-5 space-y-5">
                    <div className="flex items-center gap-2 font-semibold text-lg text-foreground pb-2 border-b">
                      <span className="text-primary">⚡</span> 필터
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="main-category" className="text-sm font-medium text-foreground">
                        카테고리
                      </label>
                      <Select
                        value={mainCategoryValue}
                        onValueChange={(value) => {
                          setMainCategoryValue(value);
                          setSubCategoryValue("");
                          setDetailCategoryValue("");
                        }}
                      >
                        <SelectTrigger id="main-category" className="w-full bg-background">
                          <SelectValue placeholder="대분류 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="전체">
                            전체
                          </SelectItem>
                          {mainCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="sub-category" className="text-sm font-medium text-foreground">
                        중분류
                      </label>
                      <Select
                        value={subCategoryValue}
                        onValueChange={(value) => {
                          setSubCategoryValue(value);
                          setDetailCategoryValue("");
                        }}
                      >
                        <SelectTrigger id="sub-category" className="w-full bg-background">
                          <SelectValue placeholder="중분류 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="전체">
                            전체
                          </SelectItem>
                          {subcategories.map((subcategory) => (
                            <SelectItem
                              key={subcategory.value}
                              value={subcategory.value}
                            >
                              {subcategory.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="detail-category" className="text-sm font-medium text-foreground">
                        소분류
                      </label>
                      <Select
                        value={detailCategoryValue}
                        onValueChange={(value) => {
                          setDetailCategoryValue(value);
                        }}
                      >
                        <SelectTrigger id="detail-category" className="w-full bg-background">
                          <SelectValue placeholder="소분류 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="전체">
                            전체
                          </SelectItem>
                          {detailCategories.map((detailCategory) => (
                            <SelectItem
                              key={detailCategory.value}
                              value={detailCategory.value}
                            >
                              {detailCategory.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="main-region" className="text-sm font-medium text-foreground">
                        지역 (시/도)
                      </label>
                      <Select
                        value={mainRegionValue}
                        onValueChange={(value) => {
                          setMainRegionValue(value);
                          setDetailRegionValue("");
                        }}
                      >
                        <SelectTrigger id="main-region" className="w-full bg-background">
                          <SelectValue placeholder="전체 지역" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="전체">전체 지역</SelectItem>
                          {mainRegions.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="detail-region" className="text-sm font-medium text-foreground">
                        지역 (시/군/구)
                      </label>
                      <Select
                        value={detailRegionValue}
                        onValueChange={(value) => {
                          setDetailRegionValue(value);
                        }}
                      >
                        <SelectTrigger id="detail-region" className="w-full bg-background">
                          <SelectValue placeholder="전체" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="전체">
                            전체
                          </SelectItem>
                          {regions.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="recruit-status" className="text-sm font-medium text-foreground">
                        모집 상태
                      </label>
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger id="recruit-status" className="w-full bg-background">
                          <SelectValue placeholder="전체 상태" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="전체 상태">전체 상태</SelectItem>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(mainCategoryValue !== "전체" ||
                    subCategoryValue !== "전체" ||
                    detailCategoryValue !== "전체" ||
                      mainRegionValue !== "전체" ||
                      detailRegionValue !== "전체" ||
                      selectedStatus !== "전체 상태") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMainCategoryValue("전체");
                          setSubCategoryValue("전체");
                          setDetailCategoryValue("전체");
                          setMainRegionValue("전체");
                          setDetailRegionValue("전체");
                          setSelectedStatus("전체 상태");
                          setSearchQuery("");
                        }}
                        className="w-full mt-2"
                      >
                        필터 초기화
                      </Button>
                    )}
                  </Card>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* Search Bar */}
                <div className="relative group">
                  <Input
                    placeholder="스터디 제목, 내용, 스터디명으로 검색해보세요"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 py-6 text-base bg-card border-border/60 shadow-sm focus-visible:ring-primary/30 transition-all group-hover:border-primary/50"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-primary transition-colors" />
                </div>

                {/* Results Counter */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    총{" "}
                    <span className="font-bold text-foreground">
                      {filteredPosts.length}
                    </span>
                    개의 스터디가 모집중입니다
                  </p>
                </div>

                {/* Posts Grid */}
                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPosts.map((post) => (
                      <Link key={post.id} href={`/posts/${post.id}`}>
                        <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col cursor-pointer border-border/60 hover:border-primary/50 p-0 gap-0">
                          {/* Thumbnail Image */}
                          <div className="relative w-full h-48 bg-muted overflow-hidden">
                            <Image
                              src={
                                getImageUrl(post.imageUrl?.[0]?.url || "/default-post-thumbnail.jpg")
                              }
                              alt={post.title}
                              fill
                              sizes="(max-width: 640px) 100vw, 424px"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3">
                              <Badge
                                className={`${getStatusColor(
                                  post.study?.status || ""
                                )} border-0 shadow-sm`}
                              >
                                { studyStatusConversion(post.study?.status || "")}
                              </Badge>
                            </div>
                          </div>

                          <div className="p-5 flex-1 flex flex-col gap-4">
                            {/* Post Title & Content */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                
                                  {getCategoryPath(Number(post.study?.studyCategory || 0)).labels.map((category) => (
                                    <Badge key={category} variant="outline" className={`text-xs font-normal`}>
                                      {category}
                                    </Badge>  
                                  ))}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />{" "}
                                  {getRegionPath(Number(post.study?.region || 0)).labels.map((region) => (
                                    <span key={region}>{region}</span>
                                  ))}
                                </span>
                              </div>
                              <h1 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-1">
                                {post.title}
                              </h1>
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {post.study?.description || ""}
                              </p>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-border/50 w-full" />

                            {/* Study Info & Stats */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span className="text-xs">
                                    {new Date(
                                      post.createdAt ||
                                        new Date().toISOString()
                                    ).toLocaleDateString("ko-KR")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-xs font-medium">
                                    <span className="text-foreground">
                                      {post.study?.currentParticipants || 0}
                                    </span>
                                    <span className="text-muted-foreground">
                                      /{post.study?.maxParticipants || 0}명
                                    </span>
                                  </span>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-500"
                                  style={{
                                    width: `${
                                      (post.study?.currentParticipants || 0) > 0 ? (post.study?.currentParticipants || 0) /
                                        (post.study?.maxParticipants || 0) * 100 : 0
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Footer: Author & Metrics */}
                            <div className="flex items-center justify-between mt-auto pt-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 ring-1 ring-border">
                                  <AvatarImage
                                    src={getProfileImageUrl(post.author?.avatarUrl)}
                                    alt={post.author?.email || ""}
                                  />
                                  <AvatarFallback className="text-[10px] bg-secondary">
                                    {post.author?.email?.[0] || ""}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-muted-foreground">
                                  {post.author?.username || ""}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />{" "}
                                  {post.likesCount}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> {post.viewsCount}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-dashed border-border">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h1 className="text-lg font-semibold text-foreground mb-1">
                      검색 결과가 없습니다
                    </h1>
                    <p className="text-muted-foreground mb-6 text-center max-w-xs">
                      다른 키워드로 검색하거나 필터를 초기화해보세요.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setMainCategoryValue("전체");
                        setSubCategoryValue("전체");
                        setDetailCategoryValue("전체");
                        setMainRegionValue("전체");
                        setDetailRegionValue("전체");
                        setSelectedStatus("전체 상태");
                      }}
                    >
                      필터 초기화
                    </Button>
                  </div>
                )}

                {/* Infinite Scroll Indicator */}
                {filteredPosts.length > 0 && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
    )
}