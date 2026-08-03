"use client";

import { PostDetailView } from "@/entities/post";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { increaseViewCount } from "../api/increaseViewCountAction";
import { useViewCountStore } from "./viewCountStore";

/**
 * 포스트 상세 진입 시 조회수를 세션당 한 번만 증가시킨다.
 *
 * 증가분은 서버(RPC)뿐 아니라 **React Query 캐시(post(id))에도 낙관적 +1**로 반영한다.
 * usePostDetail이 initialData+staleTime으로 캐시를 서빙하므로, 캐시를 직접 올려야
 * 세션 내 재진입에서도 증가한 수치가 유지된다(서버가 fresh 값을 줘도 캐시가 있으면
 * initialData는 무시되기 때문). 실패 시 캐시와 store를 롤백한다.
 */
export function useTrackPostView(postId: number) {
  const { hasViewed, markAsViewed } = useViewCountStore();
  const queryClient = useQueryClient();

  // "이번 마운트가 새 조회인가"를 마운트 시점에 한 번 확정.
  const [countsThisMount, setCountsThisMount] = useState(() => !hasViewed(postId));
  // 같은 화면에서 다른 글(postId)로 바뀌면 다시 판정 (adjust-during-render).
  const [trackedPostId, setTrackedPostId] = useState(postId);
  if (trackedPostId !== postId) {
    setTrackedPostId(postId);
    setCountsThisMount(!hasViewed(postId));
  }

  useEffect(() => {
    if (!countsThisMount) return; // 이미 본 글이면 아무것도 안 함
    // Strict Mode 이중 이펙트/재마운트로 인한 중복 증가 방지 (store가 진실).
    if (hasViewed(postId)) return;

    markAsViewed(postId);

    const bumpViews = (delta: number) =>
      queryClient.setQueryData<PostDetailView>(queryKeys.post(postId), (old) =>
        old ? { ...old, viewsCount: old.viewsCount + delta } : old,
      );

    bumpViews(1); // 캐시 낙관적 +1
    increaseViewCount(postId).catch(() => {
      // 실패 롤백: 캐시/스토어 원복 (async 콜백이라 set-state-in-effect 아님)
      setCountsThisMount(false);
      useViewCountStore.getState().viewedPostIds.delete(postId);
      bumpViews(-1);
    });
  }, [postId, countsThisMount, hasViewed, markAsViewed, queryClient]);
}
