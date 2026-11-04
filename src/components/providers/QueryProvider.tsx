"use client"; // React context(Provider)는 클라이언트 컴포넌트에서만 쓸 수 있다 (Next.js 문서: Context providers)

// 앱 전체를 감싸서, 어느 화면에서든 useQuery·useMutation 으로 같은 캐시 창고(QueryClient)를 쓰게 해 줍니다.

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient(); // 브라우저에서는 늘 같은 창고
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
