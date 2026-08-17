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
import { Calendar, ChevronDown, Eye, MapPin, Search, SlidersHorizontal, ThumbsUp, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

// 플래너 월드 상태 태그 — 형광펜 코딩(모집중=민트, 마감=코랄, 그 외=잉크 약). entities/post/ui/PostCard와 동일 규칙.
function statusClass(status: string): string {
  if (status === "recruiting") return "bg-hl-mint text-ink";
  if (status === "closed") return "bg-hl-coral text-ink";
  return "bg-ink/10 text-ink-soft";
}

// 필터 사이드바용 경량 아코디언 섹션(접기·펴기). 새 의존성 없이 로컬 state로 처리.
function FilterGroup({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-dashed border-paper-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-ink"
      >
        {title}
        <ChevronDown
          className={`w-4 h-4 text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="space-y-3 pb-4">{children}</div>}
    </div>
  );
}


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

    // 입력은 즉시 반영하되(searchQuery), 무거운 필터링은 지연값으로 돌려 타이핑 반응성 확보.
    // 네트워크 호출이 아닌 순수 클라이언트 필터라 setTimeout debounce 대신 useDeferredValue가 맞다.
    const deferredSearch = useDeferredValue(searchQuery);

  const [selectedStatus, setSelectedStatus] = useState("전체 상태");
  const [sortBy, setSortBy] = useState("latest");
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prevFilterSig, setPrevFilterSig] = useState("");
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

  // 점진적 노출 — 부모를 골라야 자식 셀렉트가 나타난다.
  const showSubCategory = mainCategoryValue !== "" && mainCategoryValue !== "전체";
  const showDetailCategory = showSubCategory && subCategoryValue !== "" && subCategoryValue !== "전체";
  const showDetailRegion = mainRegionValue !== "" && mainRegionValue !== "전체";

  const filteredPosts = allPosts.filter((post: PostWithStudyView) => {

    const q = deferredSearch.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(q) ||
      post.study.description?.toLowerCase().includes(q) ||
      post.study.title?.toLowerCase().includes(q);

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

  // 필터링된 결과에 정렬 적용 (전량 클라이언트 로드이므로 여기서 정렬)
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "members":
        return (b.study?.currentParticipants || 0) - (a.study?.currentParticipants || 0);
      case "popular":
        return (
          (b.likesCount || 0) - (a.likesCount || 0) ||
          (b.viewsCount || 0) - (a.viewsCount || 0)
        );
      case "latest":
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  // 필터/정렬이 바뀌면 "더 보기" 개수를 처음으로 되돌린다 (in-render 리셋 — 이 파일의 prevSearch 패턴과 동일)
  const filterSignature = [
    deferredSearch, mainCategoryValue, subCategoryValue, detailCategoryValue,
    mainRegionValue, detailRegionValue, selectedStatus, sortBy,
  ].join("|");
  if (filterSignature !== prevFilterSig) {
    setPrevFilterSig(filterSignature);
    setVisibleCount(PAGE_SIZE);
  }
  const visiblePosts = sortedPosts.slice(0, visibleCount);

    return (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Filters */}
              <aside className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <Card className="bg-paper border-2 border-ink/15 rounded-xl shadow-soft p-5">
                    <div className="flex items-center gap-2 font-semibold text-lg text-ink pb-3 border-b border-dashed border-paper-line">
                      <SlidersHorizontal className="w-5 h-5 text-ink" /> 필터
                    </div>

                    {/* 카테고리 그룹 — 부모를 골라야 중/소분류가 나타난다.
                        URL로 카테고리가 넘어온 경우(initialCategory)엔 적용된 필터가 보이도록 펼쳐서 시작 */}
                    <FilterGroup title="카테고리" defaultOpen={showSubCategory}>
                      <div className="space-y-2">
                        <label htmlFor="main-category" className="text-sm font-medium text-ink">
                          대분류
                        </label>
                        <Select
                          value={mainCategoryValue}
                          onValueChange={(value) => {
                            setMainCategoryValue(value);
                            setSubCategoryValue("");
                            setDetailCategoryValue("");
                          }}
                        >
                          <SelectTrigger id="main-category" className="w-full bg-paper border-2 border-ink/15 text-ink">
                            <SelectValue placeholder="대분류 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="전체">전체</SelectItem>
                            {mainCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {showSubCategory && (
                        <div className="space-y-2">
                          <label htmlFor="sub-category" className="text-sm font-medium text-ink">
                            중분류
                          </label>
                          <Select
                            value={subCategoryValue}
                            onValueChange={(value) => {
                              setSubCategoryValue(value);
                              setDetailCategoryValue("");
                            }}
                          >
                            <SelectTrigger id="sub-category" className="w-full bg-paper border-2 border-ink/15 text-ink">
                              <SelectValue placeholder="중분류 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="전체">전체</SelectItem>
                              {subcategories.map((subcategory) => (
                                <SelectItem key={subcategory.value} value={subcategory.value}>
                                  {subcategory.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {showDetailCategory && (
                        <div className="space-y-2">
                          <label htmlFor="detail-category" className="text-sm font-medium text-ink">
                            소분류
                          </label>
                          <Select
                            value={detailCategoryValue}
                            onValueChange={(value) => {
                              setDetailCategoryValue(value);
                            }}
                          >
                            <SelectTrigger id="detail-category" className="w-full bg-paper border-2 border-ink/15 text-ink">
                              <SelectValue placeholder="소분류 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="전체">전체</SelectItem>
                              {detailCategories.map((detailCategory) => (
                                <SelectItem key={detailCategory.value} value={detailCategory.value}>
                                  {detailCategory.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </FilterGroup>

                    {/* 지역 그룹 — 시/도를 골라야 시/군/구가 나타난다 */}
                    <FilterGroup title="지역">
                      <div className="space-y-2">
                        <label htmlFor="main-region" className="text-sm font-medium text-ink">
                          시/도
                        </label>
                        <Select
                          value={mainRegionValue}
                          onValueChange={(value) => {
                            setMainRegionValue(value);
                            setDetailRegionValue("");
                          }}
                        >
                          <SelectTrigger id="main-region" className="w-full bg-paper border-2 border-ink/15 text-ink">
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

                      {showDetailRegion && (
                        <div className="space-y-2">
                          <label htmlFor="detail-region" className="text-sm font-medium text-ink">
                            시/군/구
                          </label>
                          <Select
                            value={detailRegionValue}
                            onValueChange={(value) => {
                              setDetailRegionValue(value);
                            }}
                          >
                            <SelectTrigger id="detail-region" className="w-full bg-paper border-2 border-ink/15 text-ink">
                              <SelectValue placeholder="전체" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="전체">전체</SelectItem>
                              {regions.map((region) => (
                                <SelectItem key={region.value} value={region.value}>
                                  {region.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </FilterGroup>

                    {/* 모집 상태 그룹 */}
                    <FilterGroup title="모집 상태">
                      <div className="space-y-2">
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger id="recruit-status" aria-label="모집 상태" className="w-full bg-paper border-2 border-ink/15 text-ink">
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
                    </FilterGroup>

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
                        className="w-full mt-2 border-2 border-ink/20 bg-transparent text-ink hover:bg-ink/5"
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
                    className="pl-11 py-6 text-base bg-paper border-2 border-ink/15 text-ink placeholder-ink-soft shadow-soft focus-visible:ring-ink/20 transition-all group-hover:border-ink/40"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-soft w-5 h-5 group-hover:text-ink transition-colors" />
                </div>

                {/* Results Counter + Sort */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <p className="text-sm text-ink-soft">
                    총{" "}
                    <span className="font-bold tabular-nums text-ink">
                      {sortedPosts.length}
                    </span>
                    개의 스터디
                  </p>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort" className="w-36 bg-paper border-2 border-ink/15 text-ink" aria-label="정렬 기준">
                      <SelectValue placeholder="정렬" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">최신순</SelectItem>
                      <SelectItem value="members">참여 인원순</SelectItem>
                      <SelectItem value="popular">인기순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Posts Grid */}
                {sortedPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {visiblePosts.map((post) => (
                      <Link key={post.id} href={`/posts/${post.id}`}>
                        <Card className="group overflow-hidden transition-all duration-300 h-full flex flex-col cursor-pointer rounded-xl border-2 border-ink/15 bg-paper text-ink shadow-soft hover:-translate-y-1 hover:border-ink/40 hover:shadow-lift p-0 gap-0">
                          {/* Thumbnail Image */}
                          <div className="relative w-full h-48 bg-paper-line overflow-hidden">
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
                                className={`${statusClass(
                                  post.study?.status || ""
                                )} border-0 rounded-md font-bold shadow-soft`}
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
                                    <Badge key={category} className={`rounded-md border-0 bg-ink/5 text-ink text-xs font-medium`}>
                                      {category}
                                    </Badge>
                                  ))}
                                <span className="text-xs text-ink-soft flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />{" "}
                                  {getRegionPath(Number(post.study?.region || 0)).labels.map((region) => (
                                    <span key={region}>{region}</span>
                                  ))}
                                </span>
                              </div>
                              <h1 className="font-bold text-lg text-ink line-clamp-2 group-hover:text-ink/60 transition-colors mb-1">
                                {post.title}
                              </h1>
                              <p className="text-sm text-ink-soft line-clamp-2 leading-relaxed">
                                {post.study?.description || ""}
                              </p>
                            </div>

                            {/* Divider */}
                            <div className="border-t-2 border-dashed border-paper-line w-full" />

                            {/* Study Info & Stats */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-1.5 text-ink-soft">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span className="text-xs tabular-nums">
                                    {new Date(
                                      post.createdAt ||
                                        new Date().toISOString()
                                    ).toLocaleDateString("ko-KR")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-ink" />
                                  <span className="text-xs font-medium tabular-nums">
                                    <span className="text-ink">
                                      {post.study?.currentParticipants || 0}
                                    </span>
                                    <span className="text-ink-soft">
                                      /{post.study?.maxParticipants || 0}명
                                    </span>
                                  </span>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full bg-ink/10 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-hl-coral rounded-full transition-all duration-500"
                                  style={{
                                    width: `${
                                      (post.study?.maxParticipants || 0) > 0
                                        ? Math.min(100, (post.study?.currentParticipants || 0) /
                                          (post.study?.maxParticipants || 0) * 100)
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Footer: Author & Metrics */}
                            <div className="flex items-center justify-between mt-auto pt-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 ring-1 ring-ink/10">
                                  <AvatarImage
                                    src={getProfileImageUrl(post.author?.avatarUrl)}
                                    alt={post.author?.email || ""}
                                  />
                                  <AvatarFallback className="text-xs bg-ink text-paper">
                                    {post.author?.email?.[0] || ""}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-ink-soft">
                                  {post.author?.username || ""}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-ink-soft">
                                <div className="flex items-center gap-1 tabular-nums">
                                  <ThumbsUp className="w-3 h-3" />{" "}
                                  {post.likesCount}
                                </div>
                                <div className="flex items-center gap-1 tabular-nums">
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
                  <div className="flex flex-col items-center justify-center py-16 bg-paper rounded-xl border-2 border-dashed border-paper-line">
                    <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-ink-soft" />
                    </div>
                    <h1 className="text-lg font-semibold text-ink mb-1">
                      검색 결과가 없습니다
                    </h1>
                    <p className="text-ink-soft mb-6 text-center max-w-xs">
                      다른 키워드로 검색하거나 필터를 초기화해보세요.
                    </p>
                    <Button
                      variant="outline"
                      className="border-2 border-ink/20 bg-transparent text-ink hover:bg-ink/5"
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

                {/* 더 보기 — 클라이언트 페이지네이션(한 번에 PAGE_SIZE개씩 렌더해 대량 목록 성능 확보) */}
                {visibleCount < sortedPosts.length && (
                  <div className="flex justify-center py-8">
                    <Button
                      variant="outline"
                      className="border-2 border-ink/20 bg-transparent text-ink hover:bg-ink/5"
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    >
                      더 보기 ({sortedPosts.length - visibleCount}개 남음)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
    )
}