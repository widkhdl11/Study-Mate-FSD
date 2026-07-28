"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { increaseViewCount } from "../api/increaseViewCountAction";
import { useViewCountStore } from "./viewCountStore";

// hydration 됐는지 여부. 서버 스냅샷=false, 클라 스냅샷=true → setState-in-effect 없이 2-pass 처리.
const emptySubscribe = () => () => {};
function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // 클라 스냅샷
    () => false, // 서버 스냅샷
  );
}

/**
 * 포스트 상세 페이지에서 조회수 증가를 한 번만 호출하도록 관리
 * Zustand Store로 세션 내 중복 호출 방지
 *
 * @returns shouldAddView - +1 낙관적 표시 여부 (마운트 후에만 유효, hydration 일치 위해)
 */
export function useTrackPostView(postId: number) {
  const { hasViewed, markAsViewed } = useViewCountStore();
  const mounted = useIsHydrated();

  // "이번에 조회수를 올리는(=새 조회) 건인가"를 마운트 시점에 한 번 확정한다.
  // markAsViewed로 store가 바뀌어도 이 값은 고정 → "+1" 표시가 깜빡이지 않음.
  const [countsThisMount, setCountsThisMount] = useState(() => !hasViewed(postId));
  // 같은 화면에서 다른 글(postId)로 바뀌면 다시 판정 (adjust-during-render).
  const [trackedPostId, setTrackedPostId] = useState(postId);
  if (trackedPostId !== postId) {
    setTrackedPostId(postId);
    setCountsThisMount(!hasViewed(postId));
  }

  useEffect(() => {
    if (!countsThisMount) return; // 이미 본 글이면 아무것도 안 함

    markAsViewed(postId); // 로컬 스토리지에 post id 추가(낙관적)
    increaseViewCount(postId).catch(() => {
      // 실패 롤백: "+1" 숨기고 store에서도 제거. (async 콜백이라 set-state-in-effect 아님)
      setCountsThisMount(false);
      useViewCountStore.getState().viewedPostIds.delete(postId);
    });
  }, [postId, countsThisMount, markAsViewed]);

  const shouldAddView = mounted && countsThisMount; // 마운트 후에만 유효, hydration 일치 위해
  return { shouldAddView };
}
