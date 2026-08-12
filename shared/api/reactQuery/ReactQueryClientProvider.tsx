"use client";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({});
}

// 브라우저 전용 싱글턴. 서버에서는 절대 재사용하지 않는다.
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // 서버: 요청마다 새 클라이언트. 모듈 레벨 싱글턴을 서버에서 공유하면
    // 요청·유저 간 캐시가 섞여 (1) SSR/하이드레이션 불일치, (2) 유저 간 데이터 유출이 생긴다.
    return makeQueryClient();
  }
  // 브라우저: 최초 1회만 생성해 앱 수명 동안 재사용(소프트 내비게이션 간 캐시 유지).
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export default function ReactQueryClientProvider({
  children,
}: React.PropsWithChildren) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
