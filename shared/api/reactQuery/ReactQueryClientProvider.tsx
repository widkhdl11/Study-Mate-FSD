"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient({}); // 캐시역할

export default function ReactQueryClientProvider({
  children,
}: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
