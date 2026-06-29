"use client";

import { increaseViewCount } from "@/actions/postAction";
import { useViewCountStore } from "@/shared/lib/zustand/stores/viewCountStore";
import { useEffect, useRef, useState } from "react";

/**
 * 포스트 상세 페이지에서 조회수 증가를 한 번만 호출하도록 관리
 * Zustand Store로 세션 내 중복 호출 방지
 *
 * @returns shouldAddView - +1 낙관적 표시 여부 (마운트 후에만 유효, hydration 일치 위해)
 */
export function useTrackPostView(postId: number) {
  const { hasViewed, markAsViewed } = useViewCountStore();
  const [mounted, setMounted] = useState(false);
  const hasCountedThisMount = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []); // 마운트 후에만 유효, hydration 일치 위해

  useEffect(() => {
    if (hasViewed(postId)) return; // 로컬 스토리지에 있는 post id 인가? 있다면 바로 리턴

    hasCountedThisMount.current = true; // 없다면 카운트 완료 표시
    markAsViewed(postId); // 로컬 스토리지에 post id 추가
    increaseViewCount(postId).catch((err) => {
      useViewCountStore.getState().viewedPostIds.delete(postId); // 오류 발생 시 로컬 스토리지에서 post id 삭제
      hasCountedThisMount.current = false; // 카운트 완료 표시 취소
    });
  }, [postId, hasViewed, markAsViewed]);

  const isNewView = !hasViewed(postId); // 로컬 스토리지에 있는 post id 인가? 없다면 새로운 조회
  const shouldAddView = mounted && (isNewView || hasCountedThisMount.current); // 마운트 후에만 유효, hydration 일치 위해
  return { shouldAddView };
}