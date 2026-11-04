// TanStack Query 의 QueryClient(= 서버에서 가져온 데이터를 보관하는 "캐시 창고")를 만드는 곳입니다.
// 화면(QueryProvider)과 화면 밖 코드(로그인 처리 useAuthStore)가 같은 창고를 쓰도록 여기서 하나만 만듭니다.

import { isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 한 번 가져온 데이터는 1분 동안 "신선하다"고 보고 다시 묻지 않는다
        staleTime: 60 * 1000,
        // 실시간 기능은 쓰지 않는다: 다른 탭에 갔다 돌아왔을 때 저절로 다시 가져오는 기능을 끈다
        // (데이터는 처음 열 때, 그리고 우리가 추가·수정·삭제한 직후에만 다시 가져온다)
        refetchOnWindowFocus: false,
        retry: 1, // 실패하면 한 번만 다시 시도
      },
    },
  });
}

// 브라우저에서는 창고를 하나만 만들어 계속 쓴다 (페이지를 옮겨 다녀도 캐시가 유지됨)
let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  // 서버에서 화면을 미리 그릴 때는 요청마다 새 창고 (다른 방문자의 데이터와 섞이지 않게)
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
