import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'

const VIEW_COUNT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 1일

interface ViewCountStore {
  /** 이 세션에서 이미 조회수 증가 API를 호출한 postId 집합 */
  viewedPostIds: Set<number>;
  /** postId를 '조회함'으로 기록 (중복 호출 방지) */
  markAsViewed: (postId: number) => void;
  /** postId가 이미 조회된 적 있는지 */
  hasViewed: (postId: number) => boolean;
  /** 수동 초기화 (테스트/디버깅용) */
  resetViewedPosts: () => void;
}

export const useViewCountStore = create<ViewCountStore>()(
  persist(
    (set, get) => ({
      viewedPostIds: new Set<number>(),
      markAsViewed: (postId) => {
        set((state) => {
          const next = new Set(state.viewedPostIds);
          next.add(postId);
          return { viewedPostIds: next };
        });
      },
      hasViewed: (postId) => get().viewedPostIds.has(postId),
      resetViewedPosts: () => set({ viewedPostIds: new Set() }),
    }),
    {
      name: "view-count-store",
      partialize: (state) => ({
        viewedPostIds: Array.from(state.viewedPostIds),
        _savedAt: Date.now(),
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const savedAt = (state as { _savedAt?: number })._savedAt;
        const viewedIds = state.viewedPostIds as unknown as number[] | undefined;
        state.viewedPostIds = viewedIds ? new Set(viewedIds) : new Set();
        if (savedAt && Date.now() - savedAt > VIEW_COUNT_EXPIRY_MS) {
          state.viewedPostIds = new Set();
        }
        delete (state as { _savedAt?: number })._savedAt;
      },
      storage: createJSONStorage(() => localStorage),
    }
  )
);